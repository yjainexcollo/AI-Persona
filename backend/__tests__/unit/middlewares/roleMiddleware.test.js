const roleMiddleware = require("../../../src/middlewares/roleMiddleware");
const ApiError = require("../../../src/utils/apiError");

describe("RoleMiddleware", () => {
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

  describe("roleMiddleware", () => {
    it("should call next() when user has required role", () => {
      mockReq.user.role = "ADMIN";
      const middleware = roleMiddleware("ADMIN");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() when user has exact required role", () => {
      mockReq.user.role = "MEMBER";
      const middleware = roleMiddleware("MEMBER");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() with ApiError when user has insufficient role", () => {
      mockReq.user.role = "MEMBER";
      const middleware = roleMiddleware("ADMIN");

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
      const middleware = roleMiddleware("ADMIN");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Insufficient permissions",
        })
      );
    });

    it("should call next() with 403 status code", () => {
      mockReq.user.role = "MEMBER";
      const middleware = roleMiddleware("ADMIN");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
        })
      );
    });

    it("should handle missing user object", () => {
      mockReq.user = null;
      const middleware = roleMiddleware("MEMBER");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Authentication required",
        })
      );
    });

    it("should handle missing role property", () => {
      delete mockReq.user.role;
      const middleware = roleMiddleware("MEMBER");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: "Insufficient permissions",
        })
      );
    });

    it("should handle invalid role values", () => {
      mockReq.user.role = "INVALID_ROLE";
      const middleware = roleMiddleware("MEMBER");

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
      const middleware = roleMiddleware("MEMBER");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should work with ADMIN role requirement", () => {
      mockReq.user.role = "ADMIN";
      const middleware = roleMiddleware("ADMIN");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should reject MEMBER when ADMIN required", () => {
      mockReq.user.role = "MEMBER";
      const middleware = roleMiddleware("ADMIN");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: "Insufficient permissions",
        })
      );
    });

    it("should handle case-insensitive role comparison", () => {
      mockReq.user.role = "admin"; // lowercase
      const middleware = roleMiddleware("ADMIN"); // uppercase

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should handle empty string role", () => {
      mockReq.user.role = "";
      const middleware = roleMiddleware("MEMBER");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: "Insufficient permissions",
        })
      );
    });

    it("should handle null role", () => {
      mockReq.user.role = null;
      const middleware = roleMiddleware("MEMBER");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: "Insufficient permissions",
        })
      );
    });

    it("should handle undefined role", () => {
      mockReq.user.role = undefined;
      const middleware = roleMiddleware("MEMBER");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: "Insufficient permissions",
        })
      );
    });
  });
});
