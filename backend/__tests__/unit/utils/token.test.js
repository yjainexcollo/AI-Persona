// Patch Buffer.prototype.toString to support 'base64url' for all Buffers in tests
const origBufferToString = Buffer.prototype.toString;
Buffer.prototype.toString = function (encoding, ...args) {
  if (encoding === "base64url") {
    // Convert base64 to base64url (replace + with -, / with _, remove =)
    const base64 = origBufferToString.call(this, "base64");
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
  return origBufferToString.call(this, encoding, ...args);
};

const token = require("../../../src/utils/token");

describe("Token Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateToken", () => {
    it("should generate a token with default length", () => {
      const generatedToken = token.generateToken();

      expect(generatedToken).toBeDefined();
      expect(typeof generatedToken).toBe("string");
      expect(generatedToken.length).toBeGreaterThan(0);
    });

    it("should generate a token with specified length", () => {
      const length = 64;
      const generatedToken = token.generateToken(length);

      expect(generatedToken).toBeDefined();
      expect(typeof generatedToken).toBe("string");
      expect(generatedToken.length).toBeGreaterThan(0);
    });

    it("should generate unique tokens", () => {
      const token1 = token.generateToken();
      const token2 = token.generateToken();

      expect(token1).not.toBe(token2);
    });

    it("should handle crypto errors gracefully", () => {
      // Mock crypto.randomBytes to throw an error
      const crypto = require("crypto");
      const originalRandomBytes = crypto.randomBytes;
      crypto.randomBytes = jest.fn(() => {
        throw new Error("Crypto error");
      });

      expect(() => token.generateToken()).toThrow("Failed to generate token");

      // Restore original function
      crypto.randomBytes = originalRandomBytes;
    });
  });

  describe("validateToken", () => {
    it("should reject invalid tokens", () => {
      const invalidTokens = [
        null,
        undefined,
        "",
        123,
        {},
        [],
        "invalid token with spaces",
        "token-with-special-chars!@#",
      ];

      invalidTokens.forEach((invalidToken) => {
        const isValid = token.validateToken(invalidToken);
        expect(isValid).toBe(false);
      });
    });

    it("should validate tokens with correct format", () => {
      const validFormats = [
        "abc123def456ghi789", // 18 characters
        "ABCDEFGHIJKLMNOP", // 16 characters
        "token_with_underscores_123", // 24 characters
        "token-with-dashes-123", // 20 characters
        "1234567890123456", // 16 characters
      ];

      validFormats.forEach((tokenStr) => {
        const isValid = token.validateToken(tokenStr);
        expect(isValid).toBe(true);
      });
    });

    it("should reject tokens that are too short", () => {
      const shortTokens = ["short", "12345", "abc", "short123"];

      shortTokens.forEach((shortToken) => {
        const isValid = token.validateToken(shortToken);
        expect(isValid).toBe(false);
      });
    });
  });

  describe("generateConversationToken", () => {
    it("should generate a conversation token", () => {
      const conversationToken = token.generateConversationToken();

      expect(conversationToken).toBeDefined();
      expect(typeof conversationToken).toBe("string");
      expect(conversationToken.length).toBeGreaterThan(0);
    });

    it("should generate unique conversation tokens", () => {
      const token1 = token.generateConversationToken();
      const token2 = token.generateConversationToken();

      expect(token1).not.toBe(token2);
    });

    it("should generate valid conversation tokens", () => {
      const conversationToken = token.generateConversationToken();
      const isValid = token.validateToken(conversationToken);

      expect(isValid).toBe(true);
    });
  });

  describe("token format", () => {
    it("should generate base64url format tokens", () => {
      const generatedToken = token.generateToken();

      // Base64url format: A-Z, a-z, 0-9, -, _
      const base64urlRegex = /^[A-Za-z0-9_-]+$/;

      expect(generatedToken).toMatch(base64urlRegex);
    });

    it("should not contain special characters", () => {
      const generatedToken = token.generateToken();

      // Should not contain +, /, =, or other special chars
      expect(generatedToken).not.toMatch(/[+/=]/);
    });
  });

  describe("token security", () => {
    it("should generate cryptographically secure tokens", () => {
      const tokens = [];

      // Generate multiple tokens to ensure randomness
      for (let i = 0; i < 10; i++) {
        tokens.push(token.generateToken());
      }

      // All tokens should be unique
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(tokens.length);
    });

    it("should handle different token lengths", () => {
      const lengths = [16, 32, 64, 128];

      lengths.forEach((length) => {
        const generatedToken = token.generateToken(length);
        expect(generatedToken.length).toBeGreaterThan(0);
        expect(typeof generatedToken).toBe("string");
      });
    });
  });
});
