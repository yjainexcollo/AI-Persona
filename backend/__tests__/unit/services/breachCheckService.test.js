const breachCheckService = require("../../../src/services/breachCheckService");

// Mock axios
jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe("BreachCheckService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkPasswordBreach", () => {
    it("should return not breached for secure password", async () => {
      const password = "SecurePassword123!";
      const mockResponse = {
        data: "ABCDE1234567890ABCDEF:1\r\nABCDE0987654321ABCDEF:5\r\n",
      };

      const axios = require("axios");
      axios.get.mockResolvedValue(mockResponse);

      const result = await breachCheckService.checkPasswordBreach(password);

      expect(result).toEqual({
        breached: false,
        count: 0,
        severity: "safe",
      });
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("https://api.pwnedpasswords.com/range/"),
        expect.objectContaining({
          headers: {
            "User-Agent": "AI-Persona-Backend/1.0.0",
            "Add-Padding": "true",
          },
        })
      );
    });

    it("should return breached for compromised password", async () => {
      const password = "password123";
      const mockResponse = {
        data: "ABCDE1234567890ABCDEF:1998\r\nABCDE0987654321ABCDEF:5\r\n",
      };

      const axios = require("axios");
      axios.get.mockResolvedValue(mockResponse);

      const result = await breachCheckService.checkPasswordBreach(password);

      expect(result).toEqual({
        breached: true,
        count: 1998,
        severity: "medium",
      });
    });

    it("should handle API errors gracefully", async () => {
      const password = "SecurePassword123!";

      const axios = require("axios");
      axios.get.mockRejectedValue(new Error("Network error"));

      const result = await breachCheckService.checkPasswordBreach(password);

      expect(result).toEqual({
        breached: false,
        count: 0,
        error: "Service unavailable",
        severity: "unknown",
      });
    });

    it("should handle network timeouts", async () => {
      const password = "SecurePassword123!";

      const axios = require("axios");
      axios.get.mockRejectedValue(new Error("timeout"));

      const result = await breachCheckService.checkPasswordBreach(password);

      expect(result).toEqual({
        breached: false,
        count: 0,
        error: "Service unavailable",
        severity: "unknown",
      });
    });

    it("should handle empty response", async () => {
      const password = "SecurePassword123!";
      const mockResponse = { data: "" };

      const axios = require("axios");
      axios.get.mockResolvedValue(mockResponse);

      const result = await breachCheckService.checkPasswordBreach(password);

      expect(result).toEqual({
        breached: false,
        count: 0,
        severity: "safe",
      });
    });

    it("should handle malformed response", async () => {
      const password = "SecurePassword123!";
      const mockResponse = { data: "invalid:format:data" };

      const axios = require("axios");
      axios.get.mockResolvedValue(mockResponse);

      const result = await breachCheckService.checkPasswordBreach(password);

      expect(result).toEqual({
        breached: false,
        count: 0,
        severity: "safe",
      });
    });
  });

  describe("validatePasswordWithBreachCheck", () => {
    it("should validate secure password", async () => {
      const password = "SecurePassword123!";
      const mockResponse = {
        data: "ABCDE1234567890ABCDEF:1\r\nABCDE0987654321ABCDEF:5\r\n",
      };

      const axios = require("axios");
      axios.get.mockResolvedValue(mockResponse);

      const result = await breachCheckService.validatePasswordWithBreachCheck(
        password
      );

      expect(result).toEqual({
        isValid: true,
        reason: "Password is secure",
        severity: "safe",
      });
    });

    it("should reject breached password", async () => {
      const password = "password123";
      const mockResponse = {
        data: "ABCDE1234567890ABCDEF:1998\r\nABCDE0987654321ABCDEF:5\r\n",
      };

      const axios = require("axios");
      axios.get.mockResolvedValue(mockResponse);

      const result = await breachCheckService.validatePasswordWithBreachCheck(
        password
      );

      expect(result).toEqual({
        isValid: false,
        reason: "Password has been breached 1998 times",
        severity: "medium",
        count: 1998,
      });
    });

    it("should handle service unavailable", async () => {
      const password = "SecurePassword123!";

      const axios = require("axios");
      axios.get.mockRejectedValue(new Error("Service unavailable"));

      const result = await breachCheckService.validatePasswordWithBreachCheck(
        password
      );

      expect(result).toEqual({
        isValid: true,
        reason: "Password is secure",
        severity: "safe",
      });
    });

    it("should handle high severity breaches", async () => {
      const password = "password123";
      const mockResponse = {
        data: "ABCDE1234567890ABCDEF:50000\r\nABCDE0987654321ABCDEF:5\r\n",
      };

      const axios = require("axios");
      axios.get.mockResolvedValue(mockResponse);

      const result = await breachCheckService.validatePasswordWithBreachCheck(
        password
      );

      expect(result).toEqual({
        isValid: false,
        reason: "Password has been breached 50000 times",
        severity: "high",
        count: 50000,
      });
    });
  });

  describe("getSeverityLevel", () => {
    it("should return safe for count 0", () => {
      const result = breachCheckService.getSeverityLevel(0);
      expect(result).toBe("safe");
    });

    it("should return low for count 1-10", () => {
      const result = breachCheckService.getSeverityLevel(5);
      expect(result).toBe("low");
    });

    it("should return medium for count 11-1000", () => {
      const result = breachCheckService.getSeverityLevel(500);
      expect(result).toBe("medium");
    });

    it("should return high for count 1001-10000", () => {
      const result = breachCheckService.getSeverityLevel(5000);
      expect(result).toBe("high");
    });

    it("should return critical for count over 10000", () => {
      const result = breachCheckService.getSeverityLevel(50000);
      expect(result).toBe("critical");
    });
  });
});
