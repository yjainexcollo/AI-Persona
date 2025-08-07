// Mock dependencies before importing the service
jest.mock("../../../src/services/breachCheckService", () => ({
  validatePasswordWithBreachCheck: jest.fn().mockResolvedValue({
    isValid: true,
    reason: "Password is secure",
    severity: "safe",
  }),
}));

jest.mock("../../../src/services/emailService", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  createEmailVerification: jest
    .fn()
    .mockResolvedValue("mock-verification-token"),
}));

// Mock bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock jwt with all required functions
jest.mock("../../../src/utils/jwt", () => ({
  generateAccessToken: jest.fn(() => "mock-access-token"),
  generateRefreshToken: jest.fn(() => "mock-refresh-token"),
  verifyToken: jest.fn(() => ({ userId: "user123" })),
  signToken: jest.fn(() => "mock-access-token"),
  signRefreshToken: jest.fn(() => "mock-refresh-token"),
  generateToken: jest.fn(() => "mock-access-token"),
}));

// Clear module cache and import the service after mocking
jest.resetModules();
const authService = require("../../../src/services/authService");

describe("AuthService", () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset mock implementations
    global.mockFindUnique.mockReset();
    global.mockCreate.mockReset();
    global.mockUpdate.mockReset();
    global.mockCount.mockReset();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "SecurePassword123!",
        name: "Test User",
      };

      const mockWorkspace = {
        id: "workspace123",
        name: "example.com",
        domain: "example.com",
      };

      global.mockFindUnique
        .mockResolvedValueOnce(null) // No existing user
        .mockResolvedValueOnce(null); // No existing workspace
      global.mockCount.mockResolvedValue(0); // First user in workspace
      global.mockCreate
        .mockResolvedValueOnce(mockWorkspace) // Workspace creation
        .mockResolvedValueOnce({
          // User creation
          id: "user123",
          email: userData.email,
          name: userData.name,
          emailVerified: false,
          status: "ACTIVE",
          role: "ADMIN",
          workspaceId: "workspace123",
          workspace: mockWorkspace,
        });

      // Mock breach check service
      const breachCheckService = require("../../../src/services/breachCheckService");
      breachCheckService.validatePasswordWithBreachCheck.mockResolvedValue({
        isValid: true,
        reason: "Password is secure",
      });

      const result = await authService.register(userData);

      expect(result).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.name).toBe(userData.name);
      expect(result.user.role).toBe("ADMIN");
      expect(result.workspace).toBeDefined();
      expect(result.workspace.id).toBe("workspace123");
    });

    it("should validate password strength", async () => {
      // Mock breach check to fail
      const breachCheckService = require("../../../src/services/breachCheckService");
      breachCheckService.validatePasswordWithBreachCheck = jest
        .fn()
        .mockResolvedValue({
          isValid: false,
          reason: "Password too weak",
        });

      const weakPassword = "123";

      await expect(
        authService.register({
          email: `test-${Date.now()}@example.com`,
          password: weakPassword,
          name: "Test User",
        })
      ).rejects.toThrow("Password too weak");
    });

    it("should handle existing user reactivation", async () => {
      const userData = {
        email: "existing@example.com",
        password: "SecurePassword123!",
        name: "Existing User",
      };

      const existingUser = {
        id: "user123",
        email: userData.email,
        name: userData.name,
        emailVerified: false,
        status: "PENDING_DELETION", // This should trigger reactivation
        role: "MEMBER",
        workspaceId: "workspace123",
      };

      global.mockFindUnique.mockResolvedValue(existingUser);
      global.mockUpdate.mockResolvedValue({
        ...existingUser,
        status: "ACTIVE",
      });

      // Mock breach check service
      const breachCheckService = require("../../../src/services/breachCheckService");
      breachCheckService.validatePasswordWithBreachCheck.mockResolvedValue({
        isValid: true,
        reason: "Password is secure",
      });

      const result = await authService.register(userData);

      expect(result).toBeDefined();
      expect(result.user.status).toBe("ACTIVE");
    });
  });

  describe("login", () => {
    it.skip("should login successfully with valid credentials", async () => {
      const credentials = {
        email: "test@example.com",
        password: "SecurePassword123!",
      };

      const mockUser = {
        id: "user123",
        email: credentials.email,
        name: "Test User",
        passwordHash: "hashed-password",
        emailVerified: true,
        status: "ACTIVE",
        role: "MEMBER",
        workspaceId: "workspace123",
      };

      global.mockFindUnique.mockResolvedValue(mockUser);

      // Mock bcrypt to return true for password comparison
      const bcrypt = require("bcrypt");
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.login(credentials);

      expect(result).toBeDefined();
      expect(result.user.email).toBe(credentials.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it("should reject unverified users", async () => {
      const testUser = {
        id: "user123",
        email: "test@example.com",
        status: "PENDING_VERIFY",
        emailVerified: false,
        passwordHash: "hashed-password",
      };

      const loginData = {
        email: testUser.email,
        password: "TestPassword123!",
      };

      global.mockFindUnique.mockResolvedValue(testUser);

      await expect(authService.login(loginData)).rejects.toThrow(
        "Please verify your email before logging in"
      );
    });
  });
});
