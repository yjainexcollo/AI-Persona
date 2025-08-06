const authMiddleware = require("../../../src/middlewares/authMiddleware");
const jwt = require("../../../src/utils/jwt");

// Mock jwt utility
jest.mock("../../../src/utils/jwt");

describe("AuthMiddleware", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: null,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("authMiddleware", () => {
    it("should authenticate valid token", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "MEMBER",
        status: "ACTIVE",
        workspaceId: "workspace123",
      };
      const mockToken = "valid-token";

      mockReq.headers.authorization = `Bearer ${mockToken}`;

      // Mock JWT verifyToken
      jwt.verifyToken = jest.fn().mockResolvedValue({ userId: mockUser.id });

      // Mock Prisma findUnique using global testPrisma
      const originalFindUnique = global.testPrisma.user.findUnique;
      global.testPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(jwt.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(mockReq.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        workspaceId: mockUser.workspaceId,
      });
      expect(mockNext).toHaveBeenCalled();

      // Restore original function
      global.testPrisma.user.findUnique = originalFindUnique;
    });

    it("should reject request without token", async () => {
      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Authorization token missing or malformed",
        })
      );
    });

    it("should reject invalid token", async () => {
      mockReq.headers.authorization = "Bearer invalid-token";

      jwt.verifyToken = jest.fn().mockRejectedValue(new Error("Invalid token"));

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Invalid or expired token",
        })
      );
    });

    it("should reject malformed authorization header", async () => {
      mockReq.headers.authorization = "InvalidFormat";

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Authorization token missing or malformed",
        })
      );
    });

    it("should reject inactive user", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "MEMBER",
        status: "INACTIVE",
        workspaceId: "workspace123",
      };
      const mockToken = "valid-token";

      mockReq.headers.authorization = `Bearer ${mockToken}`;

      // Mock JWT verifyToken
      jwt.verifyToken = jest.fn().mockResolvedValue({ userId: mockUser.id });

      // Mock Prisma findUnique
      const originalFindUnique = global.testPrisma.user.findUnique;
      global.testPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "User not found or inactive",
        })
      );

      // Restore original function
      global.testPrisma.user.findUnique = originalFindUnique;
    });
  });
});
