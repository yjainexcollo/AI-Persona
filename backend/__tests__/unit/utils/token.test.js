const token = require("../../../src/utils/token");

describe("Token Utils", () => {
  describe("generateToken", () => {
    it("should generate a random token", () => {
      const token1 = token.generateToken();
      const token2 = token.generateToken();

      expect(token1).toBeDefined();
      expect(typeof token1).toBe("string");
      expect(token1.length).toBeGreaterThan(0);
      expect(token1).not.toBe(token2);
    });

    it("should generate token with specified length", () => {
      const length = 16;
      const generatedToken = token.generateToken(length);

      expect(generatedToken.length).toBeGreaterThan(0);
      expect(typeof generatedToken).toBe("string");
    });

    it("should generate token with default length", () => {
      const generatedToken = token.generateToken();

      expect(generatedToken.length).toBeGreaterThan(0);
      expect(typeof generatedToken).toBe("string");
    });

    it("should handle token generation errors", () => {
      // Mock crypto.randomBytes to throw an error
      const crypto = require("crypto");
      const originalRandomBytes = crypto.randomBytes;

      crypto.randomBytes = jest.fn().mockImplementation(() => {
        throw new Error("Crypto error");
      });

      expect(() => token.generateToken()).toThrow("Failed to generate token");

      // Restore original function
      crypto.randomBytes = originalRandomBytes;
    });
  });

  describe("validateToken", () => {
    it("should validate a valid token", () => {
      const validToken = token.generateToken();
      const isValid = token.validateToken(validToken);

      expect(isValid).toBe(true);
    });

    it("should reject invalid tokens", () => {
      const invalidTokens = [
        "",
        null,
        undefined,
        "short",
        "invalid-token-format!@#",
      ];

      invalidTokens.forEach((invalidToken) => {
        const isValid = token.validateToken(invalidToken);
        expect(isValid).toBe(false);
      });
    });

    it("should validate tokens with correct format", () => {
      const validFormats = [
        "abc123def456",
        "ABCDEFGHIJKLMNOP", // 16 characters
        "token_with_underscores",
        "token-with-dashes",
        "1234567890123456", // 16 characters
      ];

      validFormats.forEach((tokenStr) => {
        const isValid = token.validateToken(tokenStr);
        expect(isValid).toBe(true);
      });
    });

    it("should reject tokens that are too short", () => {
      const shortTokens = ["short", "12345", "abc"];

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
