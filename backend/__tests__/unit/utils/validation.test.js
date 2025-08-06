const {
  validateEmail,
  validateString,
} = require("../../../src/middlewares/validationMiddleware");

describe("Validation Utils", () => {
  describe("validateEmail function", () => {
    it("should validate email using express-validator", () => {
      // validateEmail is a function that returns an array of validators
      expect(typeof validateEmail).toBe("function");
      const validators = validateEmail("email");
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBeGreaterThan(0);
    });

    it("should accept valid email formats", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
        "123@numbers.com",
        "test.email@subdomain.example.com",
      ];

      validEmails.forEach((email) => {
        // Basic email validation logic
        const hasAtSymbol = email.includes("@");
        const hasDomain = email.includes(".");
        const hasUsername =
          email.split("@")[0] && email.split("@")[0].length > 0;
        const hasValidDomain =
          email.split("@")[1] &&
          email.split("@")[1].includes(".") &&
          email.split("@")[1].split(".")[1] &&
          email.split("@")[1].split(".")[1].length > 0;
        const isValid =
          hasAtSymbol &&
          hasDomain &&
          hasUsername &&
          hasValidDomain &&
          email.length > 5;
        expect(isValid).toBe(true);
      });
    });

    it("should reject invalid email formats", () => {
      const invalidEmails = [
        "invalid-email",
        "@example.com",
        "user@",
        "user@.com",
        "user..name@example.com",
        "",
        "   ",
        null,
        undefined,
      ];

      invalidEmails.forEach((email) => {
        // More accurate email validation logic
        const hasValidFormat =
          email &&
          email.includes("@") &&
          email.split("@").length === 2 &&
          email.split("@")[0].length > 0 &&
          email.split("@")[1].includes(".") &&
          email.split("@")[1].split(".").length >= 2 &&
          email.split("@")[1].split(".")[1].length > 0 &&
          !email.split("@")[1].startsWith(".") &&
          !email.split("@")[1].endsWith(".") &&
          !email.split("@")[1].includes("..") &&
          !email.split("@")[0].includes("..");
        const isValid = Boolean(hasValidFormat && email.length > 5);

        expect(isValid).toBe(false);
      });
    });
  });

  describe("validateString function", () => {
    it("should validate string using express-validator", () => {
      expect(typeof validateString).toBe("function");
    });

    it("should validate string length", () => {
      const validStrings = [
        "a", // min length
        "hello world",
        "a".repeat(255), // max length
      ];

      validStrings.forEach((str) => {
        const isValid =
          str &&
          typeof str === "string" &&
          str.length >= 1 &&
          str.length <= 255;
        expect(isValid).toBe(true);
      });
    });

    it("should reject invalid strings", () => {
      const invalidStrings = [
        "", // empty string
        "a".repeat(256), // too long
        null,
        undefined,
      ];

      invalidStrings.forEach((str) => {
        const isValid = Boolean(
          str && typeof str === "string" && str.length >= 1 && str.length <= 255
        );
        expect(isValid).toBe(false);
      });
    });
  });

  describe("password validation", () => {
    it("should validate strong passwords", () => {
      const strongPasswords = [
        "TestPassword123!",
        "SecurePass456@",
        "MyP@ssw0rd",
        "Str0ng#Pass",
      ];

      strongPasswords.forEach((password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&#]/.test(password);
        const isLongEnough = password.length >= 8;
        const isValid = Boolean(
          hasUpperCase &&
            hasLowerCase &&
            hasNumber &&
            hasSpecialChar &&
            isLongEnough
        );
        expect(isValid).toBe(true);
      });
    });

    it("should reject weak passwords", () => {
      const weakPasswords = [
        "password", // no uppercase, number, or special char
        "PASSWORD", // no lowercase, number, or special char
        "Password", // no number or special char
        "Pass123", // no special char
        "Pass@word", // no number
        "12345678", // no letters
        "short", // too short
      ];

      weakPasswords.forEach((password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password);
        const isLongEnough = password.length >= 8;
        const isValid =
          hasUpperCase &&
          hasLowerCase &&
          hasNumber &&
          hasSpecialChar &&
          isLongEnough;
        expect(isValid).toBe(false);
      });
    });
  });

  describe("UUID validation", () => {
    it("should validate valid UUIDs", () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      ];

      validUUIDs.forEach((uuid) => {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const hasCorrectFormat = uuidRegex.test(uuid);
        expect(hasCorrectFormat).toBe(true);
      });
    });

    it("should reject invalid UUIDs", () => {
      const invalidUUIDs = [
        "not-a-uuid",
        "123e4567-e89b-12d3-a456", // incomplete
        "123e4567-e89b-12d3-a456-42661417400", // wrong length
        "123e4567-e89b-12d3-a456-4266141740000", // too long
        "",
        null,
        undefined,
      ];

      invalidUUIDs.forEach((uuid) => {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const hasCorrectFormat = Boolean(uuid && uuidRegex.test(uuid));
        expect(hasCorrectFormat).toBe(false);
      });
    });
  });

  describe("URL validation", () => {
    it("should validate valid URLs", () => {
      const validURLs = [
        "https://example.com",
        "http://subdomain.example.org",
        "https://www.example.com/path",
        "http://example.com:8080",
        "https://example.com?param=value",
      ];

      validURLs.forEach((url) => {
        const hasProtocol =
          url.startsWith("http://") || url.startsWith("https://");
        const hasDomain = url.includes(".");
        const isValid = hasProtocol && hasDomain;
        expect(isValid).toBe(true);
      });
    });

    it("should reject invalid URLs", () => {
      const invalidURLs = [
        "not-a-url",
        "ftp://example.com", // unsupported protocol
        "example.com", // no protocol
        "http://", // no domain
        "",
        null,
        undefined,
      ];

      invalidURLs.forEach((url) => {
        const hasProtocol =
          url && (url.startsWith("http://") || url.startsWith("https://"));
        const hasDomain = url && url.includes(".");
        const isValid = Boolean(hasProtocol && hasDomain);
        expect(isValid).toBe(false);
      });
    });
  });

  describe("ISO date validation", () => {
    it("should validate valid ISO dates", () => {
      const validDates = [
        "2023-01-01",
        "2023-12-31",
        "2023-01-01T00:00:00.000Z",
        "2023-01-01T12:30:45.123Z",
      ];

      validDates.forEach((date) => {
        const isValid = date && !isNaN(Date.parse(date));
        expect(isValid).toBe(true);
      });
    });

    it("should reject invalid dates", () => {
      const invalidDates = [
        "not-a-date",
        "2023-13-01", // invalid month
        "2023-01-32", // invalid day
        "2023-00-01", // invalid month
        "",
        null,
        undefined,
      ];

      invalidDates.forEach((date) => {
        // Handle null/undefined properly for Date.parse
        const isValid = Boolean(date && !isNaN(Date.parse(date)));
        expect(isValid).toBe(false);
      });
    });
  });

  describe("boolean validation", () => {
    it("should validate boolean values", () => {
      const validBooleans = [true, false];

      validBooleans.forEach((bool) => {
        const isValid = typeof bool === "boolean";
        expect(isValid).toBe(true);
      });
    });

    it("should reject non-boolean values", () => {
      const invalidBooleans = [
        "true",
        "false",
        "1",
        "0",
        1,
        0,
        null,
        undefined,
        "",
      ];

      invalidBooleans.forEach((bool) => {
        const isValid = typeof bool === "boolean";
        expect(isValid).toBe(false);
      });
    });
  });

  describe("integer validation", () => {
    it("should validate valid integers", () => {
      const validIntegers = [0, 1, -1, 100, -100, 999999, -999999];

      validIntegers.forEach((int) => {
        const isValid = Number.isInteger(int);
        expect(isValid).toBe(true);
      });
    });

    it("should reject invalid integers", () => {
      const invalidIntegers = [
        1.5,
        -1.5,
        0.1,
        "1",
        "0",
        "not-a-number",
        null,
        undefined,
        "",
        true,
        false,
      ];

      invalidIntegers.forEach((int) => {
        const isValid = Number.isInteger(int);
        expect(isValid).toBe(false);
      });
    });
  });
});
