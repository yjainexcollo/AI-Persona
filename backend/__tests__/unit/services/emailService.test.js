// Mock token generation
jest.mock("../../../src/utils/token", () => ({
  generateToken: jest.fn(() => "mock-verification-token"),
}));

const emailService = require("../../../src/services/emailService");

// Mock nodemailer
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    verify: jest.fn().mockResolvedValue(true),
    sendMail: jest.fn().mockResolvedValue({
      messageId: "mock-message-id",
    }),
  })),
}));

describe("EmailService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    global.mockFindUnique.mockReset();
    global.mockCreate.mockReset();
    global.mockUpdate.mockReset();
    global.mockDeleteMany.mockReset();
    global.mockCount.mockReset();
  });

  describe("testEmailConfig", () => {
    it("should return true for valid email configuration", async () => {
      const result = await emailService.testEmailConfig();
      expect(result).toBe(true);
    });

    it.skip("should return false for invalid email configuration", async () => {
      const nodemailer = require("nodemailer");
      nodemailer
        .createTransport()
        .verify.mockRejectedValue(new Error("Invalid config"));

      const result = await emailService.testEmailConfig();
      expect(result).toBe(false);
    });
  });

  describe("createEmailVerification", () => {
    it.skip("should create email verification token", async () => {
      const userId = "user123";

      global.mockCreate.mockResolvedValue({
        id: "verification123",
        userId,
        token: "mock-verification-token",
        expiresAt: new Date(),
      });

      const result = await emailService.createEmailVerification(userId);

      expect(result).toBe("mock-verification-token");
      expect(global.mockCreate).toHaveBeenCalledWith({
        data: {
          userId,
          token: "mock-verification-token",
          expiresAt: expect.any(Date),
        },
      });
    });
  });

  describe("createPasswordResetToken", () => {
    it.skip("should create password reset token", async () => {
      const userId = "user123";

      global.mockCreate.mockResolvedValue({
        id: "reset123",
        userId,
        token: "mock-reset-token",
        expiresAt: new Date(),
      });

      const result = await emailService.createPasswordResetToken(userId);

      expect(result).toBe("mock-reset-token");
      expect(global.mockCreate).toHaveBeenCalledWith({
        data: {
          userId,
          token: "mock-reset-token",
          expiresAt: expect.any(Date),
        },
      });
    });
  });

  describe("verifyEmailToken", () => {
    it.skip("should verify email token successfully", async () => {
      const token = "valid-token";
      const mockRecord = {
        id: "verification123",
        userId: "user123",
        token,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      };

      global.mockFindUnique.mockResolvedValue(mockRecord);
      global.mockUpdate.mockResolvedValue({
        id: "user123",
        emailVerified: true,
      });

      await emailService.verifyEmailToken(token);

      expect(global.mockFindUnique).toHaveBeenCalledWith({
        where: { token },
      });
      expect(global.mockUpdate).toHaveBeenCalledWith({
        where: { id: "user123" },
        data: {
          emailVerified: true,
          verifiedAt: expect.any(Date),
        },
      });
    });

    it("should throw error for invalid token", async () => {
      const token = "invalid-token";

      global.mockFindUnique.mockResolvedValue(null);

      await expect(emailService.verifyEmailToken(token)).rejects.toThrow(
        "Invalid or expired verification token"
      );
    });

    it("should throw error for expired token", async () => {
      const token = "expired-token";
      const mockRecord = {
        id: "verification123",
        userId: "user123",
        token,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      };

      global.mockFindUnique.mockResolvedValue(mockRecord);

      await expect(emailService.verifyEmailToken(token)).rejects.toThrow(
        "Invalid or expired verification token"
      );
    });
  });

  describe("sendVerificationEmail", () => {
    it.skip("should send verification email successfully", async () => {
      const user = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
      };
      const token = "mock-verification-token";

      await emailService.sendVerificationEmail(user, token);

      const nodemailer = require("nodemailer");
      expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();
    });

    it.skip("should handle email sending failure", async () => {
      const user = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
      };
      const token = "mock-verification-token";

      const nodemailer = require("nodemailer");
      nodemailer
        .createTransport()
        .sendMail.mockRejectedValue(new Error("Email failed"));

      await expect(
        emailService.sendVerificationEmail(user, token)
      ).rejects.toThrow("Email failed");
    });
  });

  describe("sendPasswordResetEmail", () => {
    it.skip("should send password reset email successfully", async () => {
      const user = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
      };
      const token = "mock-reset-token";

      await emailService.sendPasswordResetEmail(user, token);

      const nodemailer = require("nodemailer");
      expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();
    });

    it.skip("should handle email sending failure", async () => {
      const user = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
      };
      const token = "mock-reset-token";

      const nodemailer = require("nodemailer");
      nodemailer
        .createTransport()
        .sendMail.mockRejectedValue(new Error("Email failed"));

      await expect(
        emailService.sendPasswordResetEmail(user, token)
      ).rejects.toThrow("Email failed");
    });
  });

  describe("cleanupExpiredVerifications", () => {
    it("should cleanup expired verifications", async () => {
      global.mockDeleteMany.mockResolvedValue({ count: 5 });

      await emailService.cleanupExpiredVerifications();

      expect(global.mockDeleteMany).toHaveBeenCalledWith({
        where: { expiresAt: { lt: expect.any(Date) } },
      });
    });
  });
});
