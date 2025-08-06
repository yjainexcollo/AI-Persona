const request = require("supertest");
const express = require("express");
const authController = require("../../../src/controllers/authController");

// Mock the auth service
jest.mock("../../../src/services/authService", () => ({
  register: jest.fn(),
  login: jest.fn(),
  verifyEmail: jest.fn(),
  refreshTokens: jest.fn(),
  logout: jest.fn(),
}));

// Mock the validation middleware
jest.mock("../../../src/middlewares/validationMiddleware", () => ({
  handleValidationErrors: (req, res, next) => next(),
}));

// Mock the rate limiter middleware
jest.mock("../../../src/middlewares/rateLimiter", () => ({
  authLimiter: (req, res, next) => next(),
}));

const authService = require("../../../src/services/authService");

// Create test app
const app = express();
app.use(express.json());

// Add auth routes for testing
app.post("/register", authController.register);
app.post("/login", authController.login);
app.post("/verify-email", authController.verifyEmail);
app.post("/refresh-token", authController.refreshTokens);
app.post("/logout", authController.logout);

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
      };

      authService.register.mockResolvedValue({
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
      expect(response.body.data.workspace.name).toBe("Test Workspace");
      expect(authService.register).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "TestPassword123!",
        name: "Test User",
      });
    });

    it("should handle registration errors", async () => {
      authService.register.mockRejectedValue(new Error("Email already exists"));

      const response = await request(app)
        .post("/register")
        .send({
          email: "existing@example.com",
          password: "TestPassword123!",
          name: "Test User",
        })
        .expect(500);

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
      };

      authService.register.mockResolvedValue({
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
      expect(response.body.message).toContain("reactivated");
    });
  });

  describe("POST /login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "MEMBER",
      };

      authService.login.mockResolvedValue({
        user: mockUser,
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
      expect(response.body.data.user.email).toBe("test@example.com");
      expect(response.body.data.accessToken).toBe("access-token");
      expect(response.body.data.refreshToken).toBe("refresh-token");
      expect(authService.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "TestPassword123!",
      });
    });

    it("should handle login errors", async () => {
      authService.login.mockRejectedValue(new Error("Invalid credentials"));

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
        emailVerified: true,
      };

      authService.verifyEmail.mockResolvedValue({
        user: mockUser,
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });

      const response = await request(app)
        .post("/verify-email")
        .send({
          token: "verification-token",
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user.emailVerified).toBe(true);
      expect(response.body.data.accessToken).toBe("access-token");
      expect(authService.verifyEmail).toHaveBeenCalledWith(
        "verification-token"
      );
    });

    it("should handle invalid verification token", async () => {
      authService.verifyEmail.mockRejectedValue(
        new Error("Invalid or expired token")
      );

      const response = await request(app)
        .post("/verify-email")
        .send({
          token: "invalid-token",
        })
        .expect(500);

      expect(response.body.error.message).toBe("Invalid or expired token");
    });
  });

  describe("POST /refresh-token", () => {
    it("should refresh token successfully", async () => {
      authService.refreshTokens.mockResolvedValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });

      const response = await request(app)
        .post("/refresh-token")
        .send({
          refreshToken: "valid-refresh-token",
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.accessToken).toBe("new-access-token");
      expect(response.body.data.refreshToken).toBe("new-refresh-token");
      expect(authService.refreshTokens).toHaveBeenCalledWith(
        "valid-refresh-token"
      );
    });

    it("should handle invalid refresh token", async () => {
      authService.refreshTokens.mockRejectedValue(
        new Error("Invalid refresh token")
      );

      const response = await request(app)
        .post("/refresh-token")
        .send({
          refreshToken: "invalid-refresh-token",
        })
        .expect(500);

      expect(response.body.error.message).toBe("Invalid refresh token");
    });
  });

  describe("POST /logout", () => {
    it("should logout successfully", async () => {
      authService.logout.mockResolvedValue(true);

      const response = await request(app)
        .post("/logout")
        .send({
          refreshToken: "valid-refresh-token",
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Logged out successfully");
      expect(authService.logout).toHaveBeenCalledWith("valid-refresh-token");
    });

    it("should handle logout without refresh token", async () => {
      const response = await request(app).post("/logout").send({}).expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Logged out successfully");
      expect(authService.logout).not.toHaveBeenCalled();
    });
  });
});
