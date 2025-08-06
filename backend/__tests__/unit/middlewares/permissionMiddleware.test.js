const {
  checkWorkspaceAccess,
} = require("../../../src/middlewares/permissionMiddleware");
const ApiError = require("../../../src/utils/apiError");

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
      params: {
        id: "workspace123",
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("checkWorkspaceAccess", () => {
    it("should call next() when user has access to their workspace", () => {
      checkWorkspaceAccess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() when workspace ID matches user's workspace", () => {
      mockReq.params.id = "workspace123";
      mockReq.user.workspaceId = "workspace123";

      checkWorkspaceAccess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw ApiError when user tries to access different workspace", () => {
      mockReq.params.id = "other-workspace";
      mockReq.user.workspaceId = "workspace123";

      expect(() => {
        checkWorkspaceAccess(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ApiError with correct message for access denied", () => {
      mockReq.params.id = "other-workspace";

      expect(() => {
        checkWorkspaceAccess(mockReq, mockRes, mockNext);
      }).toThrow("Access denied to this workspace");

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ApiError with 403 status code", () => {
      mockReq.params.id = "other-workspace";

      try {
        checkWorkspaceAccess(mockReq, mockRes, mockNext);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(403);
      }

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle missing user object", () => {
      mockReq.user = null;

      expect(() => {
        checkWorkspaceAccess(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle missing user workspaceId", () => {
      delete mockReq.user.workspaceId;

      expect(() => {
        checkWorkspaceAccess(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle missing params object", () => {
      mockReq.params = null;

      expect(() => {
        checkWorkspaceAccess(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle missing workspace ID in params", () => {
      mockReq.params = {};

      expect(() => {
        checkWorkspaceAccess(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle empty workspace ID in params", () => {
      mockReq.params.id = "";

      expect(() => {
        checkWorkspaceAccess(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle null workspace ID in params", () => {
      mockReq.params.id = null;

      expect(() => {
        checkWorkspaceAccess(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle undefined workspace ID in params", () => {
      mockReq.params.id = undefined;

      expect(() => {
        checkWorkspaceAccess(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle null user workspaceId", () => {
      mockReq.user.workspaceId = null;

      expect(() => {
        checkWorkspaceAccess(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle undefined user workspaceId", () => {
      mockReq.user.workspaceId = undefined;

      expect(() => {
        checkWorkspaceAccess(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle empty user workspaceId", () => {
      mockReq.user.workspaceId = "";

      expect(() => {
        checkWorkspaceAccess(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should be case-sensitive for workspace ID comparison", () => {
      mockReq.params.id = "WORKSPACE123";
      mockReq.user.workspaceId = "workspace123";

      expect(() => {
        checkWorkspaceAccess(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should work with different workspace ID formats", () => {
      const testCases = [
        "workspace-123",
        "workspace_123",
        "123-workspace-456",
        "ws123",
        "cluid123abc456def789",
      ];

      testCases.forEach((workspaceId) => {
        mockReq.params.id = workspaceId;
        mockReq.user.workspaceId = workspaceId;
        mockNext.mockClear();

        checkWorkspaceAccess(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });
    });

    it("should work regardless of user role", () => {
      const roles = ["MEMBER", "ADMIN"];

      roles.forEach((role) => {
        mockReq.user.role = role;
        mockNext.mockClear();

        checkWorkspaceAccess(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });
    });
  });
});
