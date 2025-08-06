// Mock JWT for test environment
jest.mock("../../src/utils/jwt", () => {
  const jwt = require("jsonwebtoken");

  return {
    signToken: jest.fn(async (payload, options = {}) => {
      const secret =
        process.env.JWT_SECRET || "test-secret-key-for-jwt-signing";
      return jwt.sign(payload, secret, { expiresIn: "1h", ...options });
    }),

    verifyToken: jest.fn(async (token) => {
      try {
        const secret =
          process.env.JWT_SECRET || "test-secret-key-for-jwt-signing";
        return jwt.verify(token, secret);
      } catch (error) {
        throw new Error("Invalid or expired access token");
      }
    }),

    signRefreshToken: jest.fn(async (payload, options = {}) => {
      const secret =
        process.env.JWT_SECRET || "test-secret-key-for-jwt-signing";
      return jwt.sign(payload, secret, { expiresIn: "7d", ...options });
    }),

    verifyRefreshToken: jest.fn(async (token) => {
      try {
        const secret =
          process.env.JWT_SECRET || "test-secret-key-for-jwt-signing";
        return jwt.verify(token, secret);
      } catch (error) {
        throw new Error("Invalid or expired refresh token");
      }
    }),

    generateJWKS: jest.fn(async () => ({ keys: [] })),
    rotateKeys: jest.fn(async () => ({})),
    getCurrentKeys: jest.fn(async () => ({})),
  };
});

// Mock authMiddleware for tests
jest.mock("../../src/middlewares/authMiddleware", () => {
  return require("../helpers/testAuthMiddleware");
});

// Mock workspaceService for tests
jest.mock("../../src/services/workspaceService", () => {
  return require("../helpers/testWorkspaceService");
});

// Mock authService for tests
jest.mock("../../src/services/authService", () => {
  return require("../helpers/testAuthService");
});
