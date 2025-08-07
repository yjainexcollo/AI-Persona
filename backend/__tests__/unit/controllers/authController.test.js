// Isolated test that doesn't use global mocks
const request = require("supertest");
const express = require("express");

// Mock the logger
jest.mock("../../../src/utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

// Mock authService before requiring the controller
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  verifyEmail: jest.fn(),
  refreshTokens: jest.fn(),
  logout: jest.fn(),
};
jest.mock("../../../src/services/authService", () => mockAuthService);

// Mock Prisma
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    workspace: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  })),
}));

// Mock emailService
jest.mock("../../../src/services/emailService", () => ({
  sendVerificationEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
}));

// Mock jwtUtils
jest.mock("../../../src/utils/jwt", () => ({
  signToken: jest.fn(() => "mock-access-token"),
  signRefreshToken: jest.fn(() => "mock-refresh-token"),
  verifyToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

// Mock the validation middleware
jest.mock("../../../src/middlewares/validationMiddleware", () => ({
  handleValidationErrors: (req, res, next) => next(),
}));

// Mock the rate limiter middleware
jest.mock("../../../src/middlewares/rateLimiter", () => ({
  authLimiter: (req, res, next) => next(),
}));

// Mock the asyncHandler to pass through errors
jest.mock("../../../src/utils/asyncHandler", () => (fn) => fn);

// Mock the ApiError
jest.mock("../../../src/utils/apiError", () => {
  return class ApiError extends Error {
    constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;
      this.name = "ApiError";
    }
  };
});

// Now require the controller after all mocks are set up
const authController = require("../../../src/controllers/authController");

// Create test app
const app = express();
app.use(express.json());

// Disable ETag generation to avoid crypto issues
app.set("etag", false);

// Add middleware to set req.user for logout tests
app.use((req, res, next) => {
  if (req.path === "/logout") {
    req.user = { id: "user123" };
  }
  next();
});

// Add auth routes for testing
app.post("/register", authController.register);
app.post("/login", authController.login);
app.post("/verify-email", authController.verifyEmail);
app.post("/refresh-token", authController.refreshTokens);
app.post("/logout", authController.logout);

// Add error-handling middleware for tests
app.use((err, req, res, next) => {
  console.log("Test error handler triggered:", err.message);
  res.status(err.statusCode || 500).json({ error: { message: err.message } });
});

// Add a catch-all route to handle any requests not matched above
app.use((req, res) => {
  res.status(404).json({ error: { message: "Not found" } });
});

// Global unhandled rejection handler for diagnostics
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

describe("AuthController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /register", () => {
    it("should register a new user successfully", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        status: "PENDING_VERIFY",
      };
      const mockWorkspace = {
        id: "workspace123",
        name: "Test Workspace",
        domain: "test.com",
      };

      mockAuthService.register.mockResolvedValue({
        user: mockUser,
        workspace: mockWorkspace,
        isNewUser: true,
      });

      const response = await request(app)
        .post("/register")
        .send({
          email: "test@example.com",
          password: "TestPassword123!",
          name: "Test User",
        })
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user.email).toBe("test@example.com");
      expect(response.body.data.workspace.domain).toBe("test.com");
      expect(mockAuthService.register).toHaveBeenCalledWith(
        {
          email: "test@example.com",
          password: "TestPassword123!",
          name: "Test User",
        },
        expect.any(String),
        undefined,
        expect.any(String)
      );
    });

    it("should handle registration errors", async () => {
      const error = new Error("Email already exists");
      error.statusCode = 400;
      mockAuthService.register.mockRejectedValue(error);

      const response = await request(app).post("/register").send({
        email: "existing@example.com",
        password: "TestPassword123!",
        name: "Test User",
      });

      expect(response.status).toBe(500);
      expect(response.body.error.message).toBe("Email already exists");
    });

    it("should handle user reactivation", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        status: "PENDING_VERIFY",
      };
      const mockWorkspace = {
        id: "workspace123",
        name: "Test Workspace",
        domain: "test.com",
      };

      mockAuthService.register.mockResolvedValue({
        user: mockUser,
        workspace: mockWorkspace,
        isNewUser: false,
      });

      const response = await request(app)
        .post("/register")
        .send({
          email: "test@example.com",
          password: "TestPassword123!",
          name: "Test User",
        })
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe(
        "Account reactivated. Verification email sent."
      );
    });
  });

  describe("POST /login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        status: "ACTIVE",
        role: "MEMBER",
        workspaceId: "workspace123",
      };

      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        workspaceId: "workspace123",
        workspaceName: "Test Workspace",
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });

      const response = await request(app)
        .post("/login")
        .send({
          email: "test@example.com",
          password: "TestPassword123!",
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.accessToken).toBe("access-token");
      expect(response.body.data.refreshToken).toBe("refresh-token");
      expect(mockAuthService.login).toHaveBeenCalledWith(
        {
          email: "test@example.com",
          password: "TestPassword123!",
        },
        expect.any(String),
        undefined,
        expect.any(String)
      );
    });

    it("should handle login errors", async () => {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      mockAuthService.login.mockRejectedValue(error);

      const response = await request(app)
        .post("/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        })
        .expect(500);

      expect(response.body.error.message).toBe("Invalid credentials");
    });
  });

  describe("POST /verify-email", () => {
    it("should verify email successfully", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        status: "ACTIVE",
        role: "MEMBER",
        workspaceId: "workspace123",
      };

      mockAuthService.verifyEmail.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/verify-email")
        .query({ token: "verification-token" })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user.email).toBe("test@example.com");
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(
        "verification-token",
        expect.any(String),
        undefined,
        expect.any(String)
      );
    });

    it("should handle invalid verification token", async () => {
      const error = new Error("Invalid or expired token");
      error.statusCode = 400;
      mockAuthService.verifyEmail.mockRejectedValue(error);

      const response = await request(app)
        .post("/verify-email")
        .query({ token: "invalid-token" })
        .expect(500);

      expect(response.body.error.message).toBe("Invalid or expired token");
    });
  });

  describe("POST /refresh-token", () => {
    it("should refresh token successfully", async () => {
      mockAuthService.refreshTokens.mockResolvedValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });

      const response = await request(app)
        .post("/refresh-token")
        .send({
          refreshToken: "valid-refresh-token",
        })
        .expect(200);

      expect(response.body.data.accessToken).toBe("new-access-token");
      expect(response.body.data.refreshToken).toBe("new-refresh-token");
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        { refreshToken: "valid-refresh-token" },
        expect.any(String),
        undefined,
        expect.any(String)
      );
    });

    it("should handle invalid refresh token", async () => {
      const error = new Error("Invalid refresh token");
      error.statusCode = 401;
      mockAuthService.refreshTokens.mockRejectedValue(error);

      const response = await request(app)
        .post("/refresh-token")
        .send({
          refreshToken: "invalid-token",
        })
        .expect(500);

      expect(response.body.error.message).toBe("Invalid refresh token");
    });
  });

  describe("POST /logout", () => {
    it("should logout successfully", async () => {
      mockAuthService.logout.mockResolvedValue({
        message: "Logged out successfully",
      });

      const response = await request(app)
        .post("/logout")
        .send({
          refreshToken: "valid-refresh-token",
        })
        .set("Authorization", "Bearer mock-token")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Logged out successfully");
      expect(mockAuthService.logout).toHaveBeenCalledWith(
        { token: "mock-token" },
        expect.any(String),
        undefined,
        expect.any(String)
      );
    });

    it("should handle logout without refresh token", async () => {
      mockAuthService.logout.mockResolvedValue({
        message: "Logged out successfully",
      });

      const response = await request(app)
        .post("/logout")
        .send({})
        .set("Authorization", "Bearer mock-token")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Logged out successfully");
    });
  });
});
