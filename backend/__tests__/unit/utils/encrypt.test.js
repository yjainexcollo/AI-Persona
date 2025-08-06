const encrypt = require("../../../src/utils/encrypt");

describe("Encrypt Utils", () => {
  let testKey;

  beforeEach(() => {
    // Generate a test key for each test
    testKey = encrypt.generateKey();
  });

  describe("generateKey", () => {
    it("should generate a valid encryption key", () => {
      const key = encrypt.generateKey();

      expect(key).toBeDefined();
      expect(typeof key).toBe("string");
      expect(key.length).toBeGreaterThan(0);
    });

    it("should generate different keys each time", () => {
      const key1 = encrypt.generateKey();
      const key2 = encrypt.generateKey();

      expect(key1).not.toBe(key2);
    });
  });

  describe("encrypt", () => {
    it("should encrypt data", () => {
      const data = "sensitive information";
      const encrypted = encrypt.encrypt(data, testKey);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");
      expect(encrypted).not.toBe(data);
    });

    it("should encrypt different data differently", () => {
      const data1 = "first data";
      const data2 = "second data";

      const encrypted1 = encrypt.encrypt(data1, testKey);
      const encrypted2 = encrypt.encrypt(data2, testKey);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it("should handle empty string", () => {
      const data = "";
      const encrypted = encrypt.encrypt(data, testKey);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");
    });

    it("should handle null and undefined", () => {
      expect(() => encrypt.encrypt(null, testKey)).toThrow("Encryption failed");
      expect(() => encrypt.encrypt(undefined, testKey)).toThrow(
        "Encryption failed"
      );
      expect(() => encrypt.encrypt("data", null)).toThrow("Encryption failed");
      expect(() => encrypt.encrypt("data", undefined)).toThrow(
        "Encryption failed"
      );
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
      expect(() => encrypt.decrypt(null, testKey)).toThrow("Decryption failed");
      expect(() => encrypt.decrypt(undefined, testKey)).toThrow(
        "Decryption failed"
      );
      expect(() => encrypt.decrypt("data", null)).toThrow("Decryption failed");
      expect(() => encrypt.decrypt("data", undefined)).toThrow(
        "Decryption failed"
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
      const utf8Key = "my-secret-key-that-is-32-bytes-long!";
      const data = "test data";

      const encrypted = encrypt.encrypt(data, utf8Key);
      const decrypted = encrypt.decrypt(encrypted, utf8Key);

      expect(decrypted).toBe(data);
    });
  });
});
