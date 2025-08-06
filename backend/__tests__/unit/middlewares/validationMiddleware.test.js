const { body, validationResult } = require("express-validator");
const {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateEmailVerification,
  validateRefreshToken,
  validatePasswordReset,
  validatePersonaMessage,
  validateWorkspaceUpdate,
  validateProfileUpdate,
  validatePasswordChange,
} = require("../../../src/middlewares/validationMiddleware");

// Mock express-validator
jest.mock("express-validator", () => ({
  body: jest.fn(() => ({
    isEmail: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    matches: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    isURL: jest.fn().mockReturnThis(),
    custom: jest.fn().mockReturnThis(),
    escape: jest.fn().mockReturnThis(),
    trim: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
  })),
  validationResult: jest.fn(),
}));

describe("ValidationMiddleware", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("handleValidationErrors", () => {
    it("should call next() when no validation errors", () => {
      validationResult.mockReturnValue({
        isEmpty: () => true,
      });

      handleValidationErrors(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should return 400 with errors when validation fails", () => {
      const mockErrors = [
        {
          msg: "Email is required",
          param: "email",
          location: "body",
        },
        {
          msg: "Password must be at least 8 characters",
          param: "password",
          location: "body",
        },
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      handleValidationErrors(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          message: "Validation failed",
          details: mockErrors,
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should format errors correctly", () => {
      const mockErrors = [
        {
          msg: "Invalid email format",
          param: "email",
          location: "body",
          value: "invalid-email",
        },
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      handleValidationErrors(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          message: "Validation failed",
          details: mockErrors,
        },
      });
    });
  });

  describe("validateRegistration", () => {
    it("should return validation chain for registration", () => {
      const result = validateRegistration();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(body).toHaveBeenCalledWith("email");
      expect(body).toHaveBeenCalledWith("password");
      expect(body).toHaveBeenCalledWith("name");
    });

    it("should validate email field", () => {
      const mockChain = {
        isEmail: jest.fn().mockReturnThis(),
        normalizeEmail: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validateRegistration();

      expect(body).toHaveBeenCalledWith("email");
      expect(mockChain.isEmail).toHaveBeenCalled();
      expect(mockChain.normalizeEmail).toHaveBeenCalled();
    });

    it("should validate password field", () => {
      const mockChain = {
        isLength: jest.fn().mockReturnThis(),
        matches: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validateRegistration();

      expect(body).toHaveBeenCalledWith("password");
      expect(mockChain.isLength).toHaveBeenCalled();
      expect(mockChain.matches).toHaveBeenCalled();
    });

    it("should validate name field", () => {
      const mockChain = {
        isLength: jest.fn().mockReturnThis(),
        trim: jest.fn().mockReturnThis(),
        escape: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validateRegistration();

      expect(body).toHaveBeenCalledWith("name");
      expect(mockChain.isLength).toHaveBeenCalled();
      expect(mockChain.trim).toHaveBeenCalled();
      expect(mockChain.escape).toHaveBeenCalled();
    });
  });

  describe("validateLogin", () => {
    it("should return validation chain for login", () => {
      const result = validateLogin();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(body).toHaveBeenCalledWith("email");
      expect(body).toHaveBeenCalledWith("password");
    });

    it("should validate email field", () => {
      const mockChain = {
        isEmail: jest.fn().mockReturnThis(),
        normalizeEmail: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validateLogin();

      expect(body).toHaveBeenCalledWith("email");
      expect(mockChain.isEmail).toHaveBeenCalled();
      expect(mockChain.normalizeEmail).toHaveBeenCalled();
    });

    it("should validate password field", () => {
      const mockChain = {
        notEmpty: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validateLogin();

      expect(body).toHaveBeenCalledWith("password");
      expect(mockChain.notEmpty).toHaveBeenCalled();
    });
  });

  describe("validateEmailVerification", () => {
    it("should return validation chain for email verification", () => {
      const result = validateEmailVerification();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(body).toHaveBeenCalledWith("token");
    });

    it("should validate token field", () => {
      const mockChain = {
        notEmpty: jest.fn().mockReturnThis(),
        isLength: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validateEmailVerification();

      expect(body).toHaveBeenCalledWith("token");
      expect(mockChain.notEmpty).toHaveBeenCalled();
      expect(mockChain.isLength).toHaveBeenCalled();
    });
  });

  describe("validateRefreshToken", () => {
    it("should return validation chain for refresh token", () => {
      const result = validateRefreshToken();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(body).toHaveBeenCalledWith("refreshToken");
    });

    it("should validate refreshToken field", () => {
      const mockChain = {
        notEmpty: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validateRefreshToken();

      expect(body).toHaveBeenCalledWith("refreshToken");
      expect(mockChain.notEmpty).toHaveBeenCalled();
    });
  });

  describe("validatePasswordReset", () => {
    it("should return validation chain for password reset", () => {
      const result = validatePasswordReset();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(body).toHaveBeenCalledWith("token");
      expect(body).toHaveBeenCalledWith("newPassword");
    });

    it("should validate token field", () => {
      const mockChain = {
        notEmpty: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validatePasswordReset();

      expect(body).toHaveBeenCalledWith("token");
      expect(mockChain.notEmpty).toHaveBeenCalled();
    });

    it("should validate newPassword field", () => {
      const mockChain = {
        isLength: jest.fn().mockReturnThis(),
        matches: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validatePasswordReset();

      expect(body).toHaveBeenCalledWith("newPassword");
      expect(mockChain.isLength).toHaveBeenCalled();
      expect(mockChain.matches).toHaveBeenCalled();
    });
  });

  describe("validatePersonaMessage", () => {
    it("should return validation chain for persona message", () => {
      const result = validatePersonaMessage();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(body).toHaveBeenCalledWith("message");
    });

    it("should validate message field", () => {
      const mockChain = {
        notEmpty: jest.fn().mockReturnThis(),
        isLength: jest.fn().mockReturnThis(),
        trim: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validatePersonaMessage();

      expect(body).toHaveBeenCalledWith("message");
      expect(mockChain.notEmpty).toHaveBeenCalled();
      expect(mockChain.isLength).toHaveBeenCalled();
      expect(mockChain.trim).toHaveBeenCalled();
    });

    it("should validate optional fileId field", () => {
      const mockChain = {
        optional: jest.fn().mockReturnThis(),
        isLength: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validatePersonaMessage();

      expect(body).toHaveBeenCalledWith("fileId");
      expect(mockChain.optional).toHaveBeenCalled();
      expect(mockChain.isLength).toHaveBeenCalled();
    });
  });

  describe("validateWorkspaceUpdate", () => {
    it("should return validation chain for workspace update", () => {
      const result = validateWorkspaceUpdate();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should validate optional name field", () => {
      const mockChain = {
        optional: jest.fn().mockReturnThis(),
        isLength: jest.fn().mockReturnThis(),
        trim: jest.fn().mockReturnThis(),
        escape: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validateWorkspaceUpdate();

      expect(body).toHaveBeenCalledWith("name");
      expect(mockChain.optional).toHaveBeenCalled();
      expect(mockChain.isLength).toHaveBeenCalled();
      expect(mockChain.trim).toHaveBeenCalled();
      expect(mockChain.escape).toHaveBeenCalled();
    });

    it("should validate optional timezone field", () => {
      const mockChain = {
        optional: jest.fn().mockReturnThis(),
        isLength: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validateWorkspaceUpdate();

      expect(body).toHaveBeenCalledWith("timezone");
      expect(mockChain.optional).toHaveBeenCalled();
      expect(mockChain.isLength).toHaveBeenCalled();
    });

    it("should validate optional locale field", () => {
      const mockChain = {
        optional: jest.fn().mockReturnThis(),
        isIn: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validateWorkspaceUpdate();

      expect(body).toHaveBeenCalledWith("locale");
      expect(mockChain.optional).toHaveBeenCalled();
      expect(mockChain.isIn).toHaveBeenCalled();
    });
  });

  describe("validateProfileUpdate", () => {
    it("should return validation chain for profile update", () => {
      const result = validateProfileUpdate();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should validate optional name field", () => {
      const mockChain = {
        optional: jest.fn().mockReturnThis(),
        isLength: jest.fn().mockReturnThis(),
        trim: jest.fn().mockReturnThis(),
        escape: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validateProfileUpdate();

      expect(body).toHaveBeenCalledWith("name");
      expect(mockChain.optional).toHaveBeenCalled();
      expect(mockChain.isLength).toHaveBeenCalled();
      expect(mockChain.trim).toHaveBeenCalled();
      expect(mockChain.escape).toHaveBeenCalled();
    });

    it("should validate optional avatarUrl field", () => {
      const mockChain = {
        optional: jest.fn().mockReturnThis(),
        isURL: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validateProfileUpdate();

      expect(body).toHaveBeenCalledWith("avatarUrl");
      expect(mockChain.optional).toHaveBeenCalled();
      expect(mockChain.isURL).toHaveBeenCalled();
    });

    it("should validate optional timezone field", () => {
      const mockChain = {
        optional: jest.fn().mockReturnThis(),
        isLength: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validateProfileUpdate();

      expect(body).toHaveBeenCalledWith("timezone");
      expect(mockChain.optional).toHaveBeenCalled();
      expect(mockChain.isLength).toHaveBeenCalled();
    });

    it("should validate optional locale field", () => {
      const mockChain = {
        optional: jest.fn().mockReturnThis(),
        isIn: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validateProfileUpdate();

      expect(body).toHaveBeenCalledWith("locale");
      expect(mockChain.optional).toHaveBeenCalled();
      expect(mockChain.isIn).toHaveBeenCalled();
    });
  });

  describe("validatePasswordChange", () => {
    it("should return validation chain for password change", () => {
      const result = validatePasswordChange();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(body).toHaveBeenCalledWith("currentPassword");
      expect(body).toHaveBeenCalledWith("newPassword");
    });

    it("should validate currentPassword field", () => {
      const mockChain = {
        notEmpty: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validatePasswordChange();

      expect(body).toHaveBeenCalledWith("currentPassword");
      expect(mockChain.notEmpty).toHaveBeenCalled();
    });

    it("should validate newPassword field", () => {
      const mockChain = {
        isLength: jest.fn().mockReturnThis(),
        matches: jest.fn().mockReturnThis(),
        custom: jest.fn().mockReturnThis(),
      };
      body.mockReturnValue(mockChain);

      validatePasswordChange();

      expect(body).toHaveBeenCalledWith("newPassword");
      expect(mockChain.isLength).toHaveBeenCalled();
      expect(mockChain.matches).toHaveBeenCalled();
      expect(mockChain.custom).toHaveBeenCalled();
    });
  });
});
