const authService = require("../../../src/services/authService");

describe("AuthService", () => {
  beforeEach(async () => {
    // Get the mocked services from the test AuthService
    const testAuthService = require("../../helpers/testAuthService");

    // Mock breachCheckService
    testAuthService.breachCheckService.validatePasswordWithBreachCheck = jest
      .fn()
      .mockResolvedValue({
        isValid: true,
        reason: "Password is secure",
        severity: "safe",
      });

    // Mock emailService
    testAuthService.emailService.sendVerificationEmail = jest
      .fn()
      .mockResolvedValue(true);
    testAuthService.emailService.sendWelcomeEmail = jest
      .fn()
      .mockResolvedValue(true);
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: "TestPassword123!",
        name: "Test User",
      };

      const result = await authService.register(userData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.status).toBe("PENDING_VERIFY");
      expect(result.workspace).toBeDefined();

      // Check that the mocked services were called
      const testAuthService = require("../../helpers/testAuthService");
      expect(
        testAuthService.breachCheckService.validatePasswordWithBreachCheck
      ).toHaveBeenCalledWith(userData.password);
      expect(
        testAuthService.emailService.sendVerificationEmail
      ).toHaveBeenCalled();
    });

    it("should validate password strength", async () => {
      // Mock breach check to fail
      const testAuthService = require("../../helpers/testAuthService");
      testAuthService.breachCheckService.validatePasswordWithBreachCheck = jest
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
      // Create a deactivated user first
      const existingUser = await global.testUtils.createTestUser({
        status: "DEACTIVATED",
        emailVerified: false,
      });

      const result = await authService.register({
        email: existingUser.email,
        password: "NewPassword123!",
        name: "Updated Name",
      });

      expect(result.isNewUser).toBe(false);
      expect(result.user.status).toBe("PENDING_VERIFY");
    });
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const user = await global.testUtils.createTestUser({
        status: "ACTIVE",
        emailVerified: true,
      });

      const result = await authService.login({
        email: user.email,
        password: "TestPassword123!",
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(user.email);
      expect(result.accessToken).toBeDefined();
    });

    it("should reject unverified users", async () => {
      const user = await global.testUtils.createTestUser({
        status: "PENDING_VERIFY",
        emailVerified: false,
      });

      await expect(
        authService.login({
          email: user.email,
          password: "TestPassword123!",
        })
      ).rejects.toThrow("Please verify your email before logging in");
    });
  });
});
