const passwordUtils = require("../../../src/utils/password");

describe("Password Utils", () => {
  describe("hashPassword", () => {
    it("should hash password correctly", async () => {
      const password = "TestPassword123!";
      const hash = await passwordUtils.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$\d{1,2}\$/); // bcrypt hash format
    });

    it("should generate different hashes for same password", async () => {
      const password = "TestPassword123!";
      const hash1 = await passwordUtils.hashPassword(password);
      const hash2 = await passwordUtils.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it("should throw error for empty password", async () => {
      await expect(passwordUtils.hashPassword("")).rejects.toThrow(
        "Password is required"
      );
      await expect(passwordUtils.hashPassword(null)).rejects.toThrow(
        "Password is required"
      );
      await expect(passwordUtils.hashPassword(undefined)).rejects.toThrow(
        "Password is required"
      );
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const password = "TestPassword123!";
      const hash = await passwordUtils.hashPassword(password);

      const isValid = await passwordUtils.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "TestPassword123!";
      const wrongPassword = "WrongPassword123!";
      const hash = await passwordUtils.hashPassword(password);

      const isValid = await passwordUtils.verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it("should throw error for missing parameters", async () => {
      await expect(passwordUtils.verifyPassword("", "hash")).rejects.toThrow(
        "Password and hash are required"
      );
      await expect(
        passwordUtils.verifyPassword("password", "")
      ).rejects.toThrow("Password and hash are required");
      await expect(passwordUtils.verifyPassword(null, "hash")).rejects.toThrow(
        "Password and hash are required"
      );
      await expect(
        passwordUtils.verifyPassword("password", null)
      ).rejects.toThrow("Password and hash are required");
    });
  });
});
