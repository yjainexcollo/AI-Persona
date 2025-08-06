const { requireRole } = require("../../../src/middlewares/roleMiddleware");
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

  describe("requireRole", () => {
    it("should call next() when user has required role", () => {
      mockReq.user.role = "ADMIN";
      const middleware = requireRole("ADMIN");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() when user has higher role than required", () => {
      mockReq.user.role = "ADMIN";
      const middleware = requireRole("MEMBER");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw ApiError when user has insufficient role", () => {
      mockReq.user.role = "MEMBER";
      const middleware = requireRole("ADMIN");

      expect(() => {
        middleware(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ApiError with correct message for insufficient permissions", () => {
      mockReq.user.role = "MEMBER";
      const middleware = requireRole("ADMIN");

      expect(() => {
        middleware(mockReq, mockRes, mockNext);
      }).toThrow("Insufficient permissions");

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ApiError with 403 status code", () => {
      mockReq.user.role = "MEMBER";
      const middleware = requireRole("ADMIN");

      try {
        middleware(mockReq, mockRes, mockNext);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(403);
      }

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle missing user object", () => {
      mockReq.user = null;
      const middleware = requireRole("MEMBER");

      expect(() => {
        middleware(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle missing role property", () => {
      delete mockReq.user.role;
      const middleware = requireRole("MEMBER");

      expect(() => {
        middleware(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle invalid role values", () => {
      mockReq.user.role = "INVALID_ROLE";
      const middleware = requireRole("MEMBER");

      expect(() => {
        middleware(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should work with MEMBER role requirement", () => {
      mockReq.user.role = "MEMBER";
      const middleware = requireRole("MEMBER");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should work with ADMIN role requirement", () => {
      mockReq.user.role = "ADMIN";
      const middleware = requireRole("ADMIN");

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should reject MEMBER when ADMIN required", () => {
      mockReq.user.role = "MEMBER";
      const middleware = requireRole("ADMIN");

      expect(() => {
        middleware(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle case-sensitive role comparison", () => {
      mockReq.user.role = "admin"; // lowercase
      const middleware = requireRole("ADMIN"); // uppercase

      expect(() => {
        middleware(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle empty string role", () => {
      mockReq.user.role = "";
      const middleware = requireRole("MEMBER");

      expect(() => {
        middleware(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle null role", () => {
      mockReq.user.role = null;
      const middleware = requireRole("MEMBER");

      expect(() => {
        middleware(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle undefined role", () => {
      mockReq.user.role = undefined;
      const middleware = requireRole("MEMBER");

      expect(() => {
        middleware(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
