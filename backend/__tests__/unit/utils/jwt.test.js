const jwt = require("../../../src/utils/jwt");

// Mock the JWT module to avoid actual key generation during tests
jest.mock("../../../src/utils/jwt", () => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  revokeToken: jest.fn(),
  getUserById: jest.fn(),
}));

describe("JWT Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateToken", () => {
    it("should generate access token", async () => {
      const mockUser = { id: "user123", email: "test@example.com" };
      const mockToken = "mock-access-token";

      jwt.generateToken.mockResolvedValue(mockToken);

      const result = await jwt.generateToken(mockUser);

      expect(jwt.generateToken).toHaveBeenCalledWith(mockUser);
      expect(result).toBe(mockToken);
    });

    it("should handle token generation errors", async () => {
      const mockUser = { id: "user123", email: "test@example.com" };
      const error = new Error("Token generation failed");

      jwt.generateToken.mockRejectedValue(error);

      await expect(jwt.generateToken(mockUser)).rejects.toThrow(
        "Token generation failed"
      );
    });
  });

  describe("verifyToken", () => {
    it("should verify valid token", async () => {
      const mockToken = "valid-token";
      const mockPayload = { userId: "user123", email: "test@example.com" };

      jwt.verifyToken.mockResolvedValue(mockPayload);

      const result = await jwt.verifyToken(mockToken);

      expect(jwt.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual(mockPayload);
    });

    it("should reject invalid token", async () => {
      const mockToken = "invalid-token";
      const error = new Error("Invalid token");

      jwt.verifyToken.mockRejectedValue(error);

      await expect(jwt.verifyToken(mockToken)).rejects.toThrow("Invalid token");
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate refresh token", async () => {
      const mockUser = { id: "user123", email: "test@example.com" };
      const mockRefreshToken = "mock-refresh-token";

      jwt.generateRefreshToken.mockResolvedValue(mockRefreshToken);

      const result = await jwt.generateRefreshToken(mockUser);

      expect(jwt.generateRefreshToken).toHaveBeenCalledWith(mockUser);
      expect(result).toBe(mockRefreshToken);
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify valid refresh token", async () => {
      const mockRefreshToken = "valid-refresh-token";
      const mockPayload = { userId: "user123", type: "refresh" };

      jwt.verifyRefreshToken.mockResolvedValue(mockPayload);

      const result = await jwt.verifyRefreshToken(mockRefreshToken);

      expect(jwt.verifyRefreshToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(result).toEqual(mockPayload);
    });

    it("should reject invalid refresh token", async () => {
      const mockRefreshToken = "invalid-refresh-token";
      const error = new Error("Invalid refresh token");

      jwt.verifyRefreshToken.mockRejectedValue(error);

      await expect(jwt.verifyRefreshToken(mockRefreshToken)).rejects.toThrow(
        "Invalid refresh token"
      );
    });
  });

  describe("revokeToken", () => {
    it("should revoke token successfully", async () => {
      const mockToken = "token-to-revoke";

      jwt.revokeToken.mockResolvedValue(true);

      const result = await jwt.revokeToken(mockToken);

      expect(jwt.revokeToken).toHaveBeenCalledWith(mockToken);
      expect(result).toBe(true);
    });
  });

  describe("getUserById", () => {
    it("should get user by ID", async () => {
      const mockUserId = "user123";
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
      };

      jwt.getUserById.mockResolvedValue(mockUser);

      const result = await jwt.getUserById(mockUserId);

      expect(jwt.getUserById).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockUser);
    });

    it("should return null for non-existent user", async () => {
      const mockUserId = "non-existent-user";

      jwt.getUserById.mockResolvedValue(null);

      const result = await jwt.getUserById(mockUserId);

      expect(jwt.getUserById).toHaveBeenCalledWith(mockUserId);
      expect(result).toBeNull();
    });
  });
});
