const permissionMiddleware = require("../../../src/middlewares/permissionMiddleware");
const ApiError = require("../../../src/utils/apiError");

// Mock the roles utility
jest.mock("../../../src/utils/roles", () => ({
  ADMIN: ["read", "write", "delete", "manage_users"],
  MEMBER: ["read", "write"],
  GUEST: ["read"],
}));

describe("PermissionMiddleware", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      user: {
        id: "user123",
        email: "test@example.com",
        role: "MEMBER",
        workspaceId: "workspace123",
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("permissionMiddleware", () => {
    it("should call next() when user has required permission", () => {
      mockReq.user.role = "ADMIN";
      const middleware = permissionMiddleware("read");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with ApiError when user lacks required permission", () => {
      mockReq.user.role = "MEMBER";
      const middleware = permissionMiddleware("delete");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: "Insufficient permissions",
        })
      );
    });

    it("should call next() with correct message for insufficient permissions", () => {
      mockReq.user.role = "MEMBER";
      const middleware = permissionMiddleware("delete");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Insufficient permissions",
        })
      );
    });

    it("should call next() with 403 status code", () => {
      mockReq.user.role = "MEMBER";
      const middleware = permissionMiddleware("delete");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
        })
      );
    });

    it("should handle missing user object", () => {
      mockReq.user = null;
      const middleware = permissionMiddleware("read");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "User role not found",
        })
      );
    });

    it("should handle missing role property", () => {
      delete mockReq.user.role;
      const middleware = permissionMiddleware("read");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "User role not found",
        })
      );
    });

    it("should handle invalid role values", () => {
      mockReq.user.role = "INVALID_ROLE";
      const middleware = permissionMiddleware("read");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: "Insufficient permissions",
        })
      );
    });

    it("should work with MEMBER role requirement", () => {
      mockReq.user.role = "MEMBER";
      const middleware = permissionMiddleware("read");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should work with ADMIN role requirement", () => {
      mockReq.user.role = "ADMIN";
      const middleware = permissionMiddleware("manage_users");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should reject MEMBER when ADMIN required", () => {
      mockReq.user.role = "MEMBER";
      const middleware = permissionMiddleware("manage_users");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: "Insufficient permissions",
        })
      );
    });

    it("should handle case-sensitive role comparison", () => {
      mockReq.user.role = "member"; // lowercase
      const middleware = permissionMiddleware("read");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: "Insufficient permissions",
        })
      );
    });

    it("should handle empty string role", () => {
      mockReq.user.role = "";
      const middleware = permissionMiddleware("read");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "User role not found",
        })
      );
    });

    it("should handle null role", () => {
      mockReq.user.role = null;
      const middleware = permissionMiddleware("read");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "User role not found",
        })
      );
    });

    it("should handle undefined role", () => {
      mockReq.user.role = undefined;
      const middleware = permissionMiddleware("read");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "User role not found",
        })
      );
    });
  });
});
