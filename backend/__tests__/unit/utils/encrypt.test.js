const encrypt = require("../../../src/utils/encrypt");

// Mock logger
jest.mock("../../../src/utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

describe("Encrypt Utils", () => {
  const testKey = encrypt.generateKey();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("encrypt", () => {
    it("should encrypt data", () => {
      const data = "sensitive information";
      const encrypted = encrypt.encrypt(data, testKey);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it("should handle empty string", () => {
      const data = "";
      const encrypted = encrypt.encrypt(data, testKey);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");
    });

    it("should handle null and undefined", () => {
      expect(() => encrypt.encrypt(null, testKey)).toThrow(
        "Text and secret key are required"
      );
      expect(() => encrypt.encrypt(undefined, testKey)).toThrow(
        "Text and secret key are required"
      );
      expect(() => encrypt.encrypt("data", null)).toThrow(
        "Text and secret key are required"
      );
      expect(() => encrypt.encrypt("data", undefined)).toThrow(
        "Text and secret key are required"
      );
    });

    it("should handle encryption errors", () => {
      const crypto = require("crypto");
      const originalCreateCipheriv = crypto.createCipheriv;
      crypto.createCipheriv = jest.fn(() => {
        throw new Error("Crypto error");
      });
      expect(() => encrypt.encrypt("data", testKey)).toThrow(
        "Encryption failed"
      );
      crypto.createCipheriv = originalCreateCipheriv;
    });
  });

  describe("decrypt", () => {
    it("should decrypt encrypted data", () => {
      const originalData = "sensitive information";
      const encrypted = encrypt.encrypt(originalData, testKey);
      const decrypted = encrypt.decrypt(encrypted, testKey);

      expect(decrypted).toBe(originalData);
    });

    it("should handle empty string encryption/decryption", () => {
      const originalData = "";
      const encrypted = encrypt.encrypt(originalData, testKey);
      const decrypted = encrypt.decrypt(encrypted, testKey);

      expect(decrypted).toBe(originalData);
    });

    it("should throw error for invalid encrypted data", () => {
      const invalidEncrypted = "invalid-encrypted-data";

      expect(() => encrypt.decrypt(invalidEncrypted, testKey)).toThrow(
        "Decryption failed"
      );
    });

    it("should handle null and undefined", () => {
      expect(() => encrypt.decrypt(null, testKey)).toThrow(
        "Encrypted text and secret key are required"
      );
      expect(() => encrypt.decrypt(undefined, testKey)).toThrow(
        "Encrypted text and secret key are required"
      );
      expect(() => encrypt.decrypt("data", null)).toThrow(
        "Encrypted text and secret key are required"
      );
      expect(() => encrypt.decrypt("data", undefined)).toThrow(
        "Encrypted text and secret key are required"
      );
    });
  });

  describe("round trip", () => {
    it("should encrypt and decrypt complex data", () => {
      const complexData = {
        id: "user123",
        email: "test@example.com",
        preferences: {
          theme: "dark",
          notifications: true,
        },
      };

      const encrypted = encrypt.encrypt(JSON.stringify(complexData), testKey);
      const decrypted = encrypt.decrypt(encrypted, testKey);
      const parsedData = JSON.parse(decrypted);

      expect(parsedData).toEqual(complexData);
    });

    it("should handle special characters", () => {
      const specialData = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
      const encrypted = encrypt.encrypt(specialData, testKey);
      const decrypted = encrypt.decrypt(encrypted, testKey);

      expect(decrypted).toBe(specialData);
    });

    it("should handle unicode characters", () => {
      const unicodeData = "Hello 世界 🌍";
      const encrypted = encrypt.encrypt(unicodeData, testKey);
      const decrypted = encrypt.decrypt(encrypted, testKey);

      expect(decrypted).toBe(unicodeData);
    });
  });

  describe("key handling", () => {
    it("should work with base64 keys", () => {
      const base64Key = encrypt.generateKey();
      const data = "test data";

      const encrypted = encrypt.encrypt(data, base64Key);
      const decrypted = encrypt.decrypt(encrypted, base64Key);

      expect(decrypted).toBe(data);
    });

    it("should work with utf8 keys", () => {
      // 32 ASCII characters
      const utf8Key = "12345678901234567890123456789012";
      const data = "test data";

      const encrypted = encrypt.encrypt(data, utf8Key);
      const decrypted = encrypt.decrypt(encrypted, utf8Key);

      expect(decrypted).toBe(data);
    });
  });
});
