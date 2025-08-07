// Mock token generation
jest.mock("../../../src/utils/token", () => ({
  generateToken: jest.fn(() => "mock-reset-token"),
}));

// Mock password utils
jest.mock("../../../src/utils/password", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashed-password"),
  verifyPassword: jest.fn().mockResolvedValue(true),
}));

const passwordResetService = require("../../../src/services/passwordResetService");

// Mock email service
jest.mock("../../../src/services/emailService", () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

describe("PasswordResetService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    global.mockFindFirst.mockReset();
    global.mockFindUnique.mockReset();
    global.mockCreate.mockReset();
    global.mockUpdate.mockReset();
    global.mockDeleteMany.mockReset();
  });

  describe("requestPasswordReset", () => {
    it.skip("should request password reset for existing user", async () => {
      const email = "test@example.com";
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
      };

      global.mockFindFirst.mockResolvedValue(mockUser);
      global.mockDeleteMany.mockResolvedValue({ count: 1 });
      global.mockCreate.mockResolvedValue({
        id: "reset123",
        userId: "user123",
        token: "mock-token",
        expiresAt: new Date(),
      });

      await passwordResetService.requestPasswordReset(email);

      expect(global.mockFindFirst).toHaveBeenCalledWith({
        where: { email },
      });
      expect(global.mockDeleteMany).toHaveBeenCalledWith({
        where: { userId: "user123" },
      });
      expect(global.mockCreate).toHaveBeenCalledWith({
        data: {
          userId: "user123",
          token: "mock-reset-token",
          expiresAt: expect.any(Date),
        },
      });
    });

    it("should handle non-existent user gracefully", async () => {
      const email = "nonexistent@example.com";

      global.mockFindFirst.mockResolvedValue(null);

      await passwordResetService.requestPasswordReset(email);

      expect(global.mockFindFirst).toHaveBeenCalledWith({
        where: { email },
      });
      // Should not create any tokens for non-existent users
      expect(global.mockCreate).not.toHaveBeenCalled();
    });

    it("should handle email sending failure", async () => {
      const email = "test@example.com";
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
      };

      global.mockFindFirst.mockResolvedValue(mockUser);
      global.mockDeleteMany.mockResolvedValue({ count: 1 });
      global.mockCreate.mockResolvedValue({
        id: "reset123",
        userId: "user123",
        token: "mock-token",
        expiresAt: new Date(),
      });

      // Mock email service to throw error
      const emailService = require("../../../src/services/emailService");
      emailService.sendPasswordResetEmail.mockRejectedValue(
        new Error("Email failed")
      );

      await expect(
        passwordResetService.requestPasswordReset(email)
      ).rejects.toThrow("Email failed");
    });
  });

  describe("resetPassword", () => {
    it.skip("should reset password with valid token", async () => {
      const token = "valid-token";
      const newPassword = "newSecurePassword123!";

      const mockResetToken = {
        id: "reset123",
        userId: "user123",
        token,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        used: false,
      };

      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
      };

      global.mockFindUnique
        .mockResolvedValueOnce(mockResetToken) // For validateResetToken
        .mockResolvedValueOnce(mockUser); // For user lookup
      global.mockUpdate
        .mockResolvedValueOnce(mockUser) // User update
        .mockResolvedValueOnce(mockResetToken); // Token update

      await passwordResetService.resetPassword(token, newPassword);

      expect(global.mockFindUnique).toHaveBeenCalledWith({
        where: { token },
      });
      expect(global.mockUpdate).toHaveBeenCalledWith({
        where: { id: "user123" },
        data: { passwordHash: "hashed-password" },
      });
      expect(global.mockUpdate).toHaveBeenCalledWith({
        where: { token },
        data: { used: true, usedAt: expect.any(Date) },
      });
    });

    it("should throw error for invalid token", async () => {
      const token = "invalid-token";
      const newPassword = "newSecurePassword123!";

      global.mockFindUnique.mockResolvedValue(null);

      await expect(
        passwordResetService.resetPassword(token, newPassword)
      ).rejects.toThrow("Invalid or expired password reset token");
    });

    it("should throw error for expired token", async () => {
      const token = "expired-token";
      const newPassword = "newSecurePassword123!";

      const mockResetToken = {
        id: "reset123",
        userId: "user123",
        token,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        used: false,
      };

      global.mockFindUnique.mockResolvedValue(mockResetToken);

      await expect(
        passwordResetService.resetPassword(token, newPassword)
      ).rejects.toThrow("Invalid or expired password reset token");
    });

    it("should throw error for weak password", async () => {
      const token = "valid-token";
      const weakPassword = "weak";

      const mockResetToken = {
        id: "reset123",
        userId: "user123",
        token,
        expiresAt: new Date(Date.now() + 3600000),
        used: false,
      };

      global.mockFindUnique.mockResolvedValue(mockResetToken);

      // Mock password validation to fail
      const { hashPassword } = require("../../../src/utils/password");
      hashPassword.mockRejectedValue(
        new Error("Password must be at least 8 characters long")
      );

      await expect(
        passwordResetService.resetPassword(token, weakPassword)
      ).rejects.toThrow("Password must be at least 8 characters long");
    });

    it("should throw error for breached password", async () => {
      const token = "valid-token";
      const breachedPassword = "password123";

      const mockResetToken = {
        id: "reset123",
        userId: "user123",
        token,
        expiresAt: new Date(Date.now() + 3600000),
        used: false,
      };

      global.mockFindUnique.mockResolvedValue(mockResetToken);

      // Mock breach check to fail
      const { hashPassword } = require("../../../src/utils/password");
      hashPassword.mockRejectedValue(
        new Error("This password has been compromised in a data breach")
      );

      await expect(
        passwordResetService.resetPassword(token, breachedPassword)
      ).rejects.toThrow("This password has been compromised in a data breach");
    });
  });

  describe("validateResetToken", () => {
    it("should validate valid reset token", async () => {
      const token = "valid-token";
      const mockResetToken = {
        id: "reset123",
        userId: "user123",
        token,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        used: false,
      };

      global.mockFindUnique.mockResolvedValue(mockResetToken);

      const result = await passwordResetService.validateResetToken(token);

      expect(result).toBeDefined();
      expect(result.id).toBe("reset123");
      expect(result.userId).toBe("user123");
      expect(result.token).toBe(token);
    });

    it("should reject invalid reset token", async () => {
      const token = "invalid-token";

      global.mockFindUnique.mockResolvedValue(null);

      await expect(
        passwordResetService.validateResetToken(token)
      ).rejects.toThrow("Invalid or expired password reset token");
    });

    it("should reject expired reset token", async () => {
      const token = "expired-token";
      const mockResetToken = {
        id: "reset123",
        userId: "user123",
        token,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        used: false,
      };

      global.mockFindUnique.mockResolvedValue(mockResetToken);

      await expect(
        passwordResetService.validateResetToken(token)
      ).rejects.toThrow("Invalid or expired password reset token");
    });
  });
});
