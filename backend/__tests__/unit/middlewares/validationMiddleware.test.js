const {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateEmailVerification,
} = require("../../../src/middlewares/validationMiddleware");
const ApiError = require("../../../src/utils/apiError");

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
    isString: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    isBoolean: jest.fn().mockReturnThis(),
    isUUID: jest.fn().mockReturnThis(),
    isISO8601: jest.fn().mockReturnThis(),
    custom: jest.fn().mockReturnThis(),
    escape: jest.fn().mockReturnThis(),
    trim: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
  })),
  param: jest.fn(() => ({
    notEmpty: jest.fn().mockReturnThis(),
    isUUID: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    matches: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
  })),
  query: jest.fn(() => ({
    notEmpty: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    trim: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    isISO8601: jest.fn().mockReturnThis(),
    isBoolean: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    matches: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
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
      const { validationResult } = require("express-validator");
      validationResult.mockReturnValue({
        isEmpty: () => true,
      });

      handleValidationErrors(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw ApiError when validation fails", () => {
      const { validationResult } = require("express-validator");
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

      expect(() => {
        handleValidationErrors(mockReq, mockRes, mockNext);
      }).toThrow(ApiError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ApiError with correct message for validation failures", () => {
      const { validationResult } = require("express-validator");
      const mockErrors = [
        {
          msg: "Email is required",
          param: "email",
          location: "body",
        },
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      expect(() => {
        handleValidationErrors(mockReq, mockRes, mockNext);
      }).toThrow("Validation failed: Email is required");

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw ApiError with 400 status code", () => {
      const { validationResult } = require("express-validator");
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

      try {
        handleValidationErrors(mockReq, mockRes, mockNext);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(400);
      }

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle multiple validation errors", () => {
      const { validationResult } = require("express-validator");
      const mockErrors = [
        {
          msg: "Email is required",
          param: "email",
          location: "body",
        },
        {
          msg: "Password is required",
          param: "password",
          location: "body",
        },
        {
          msg: "Name is required",
          param: "name",
          location: "body",
        },
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      expect(() => {
        handleValidationErrors(mockReq, mockRes, mockNext);
      }).toThrow(
        "Validation failed: Email is required, Password is required, Name is required"
      );

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Validation Schemas", () => {
    it("should have validateRegistration function", () => {
      expect(Array.isArray(validateRegistration)).toBe(true);
      expect(validateRegistration.length).toBeGreaterThan(0);
    });

    it("should have validateLogin function", () => {
      expect(Array.isArray(validateLogin)).toBe(true);
      expect(validateLogin.length).toBeGreaterThan(0);
    });

    it("should have validateEmailVerification function", () => {
      expect(Array.isArray(validateEmailVerification)).toBe(true);
      expect(validateEmailVerification.length).toBeGreaterThan(0);
    });
  });
});
