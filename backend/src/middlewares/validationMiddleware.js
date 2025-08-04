/**
 * ValidationMiddleware - Input validation and sanitization
 * Uses express-validator for comprehensive validation
 */

const { body, param, query, validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    throw new ApiError(400, `Validation failed: ${errorMessages.join(", ")}`);
  }
  next();
};

// Registration validation
const validateRegistration = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  handleValidationErrors,
];

// Login validation
const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Password reset request validation
const validatePasswordResetRequest = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  handleValidationErrors,
];

// Password reset validation
const validatePasswordReset = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  handleValidationErrors,
];

// Email verification validation
const validateEmailVerification = [
  query("token").notEmpty().withMessage("Verification token is required"),
  handleValidationErrors,
];

// Resend verification validation
const validateResendVerification = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  handleValidationErrors,
];

// Token refresh validation
const validateTokenRefresh = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
  handleValidationErrors,
];

// Session revocation validation
const validateSessionRevocation = [
  param("sessionId").notEmpty().withMessage("Session ID is required"),
  handleValidationErrors,
];

// User ID parameter validation
const validateUserId = [
  param("id").notEmpty().withMessage("User ID is required"),
  handleValidationErrors,
];

// Pagination validation
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
];

// Search validation
const validateSearch = [
  query("q")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Search query must be at least 2 characters long"),
  handleValidationErrors,
];

// Date range validation
const validateDateRange = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
  handleValidationErrors,
];

// Generic string validation
const validateString = (fieldName, minLength = 1, maxLength = 255) => [
  body(fieldName)
    .trim()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(
      `${fieldName} must be between ${minLength} and ${maxLength} characters`
    ),
  handleValidationErrors,
];

// Generic email validation
const validateEmail = (fieldName) => [
  body(fieldName)
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  handleValidationErrors,
];

// Generic UUID/CUID validation
const validateId = (fieldName) => [
  param(fieldName).notEmpty().withMessage(`${fieldName} is required`),
  handleValidationErrors,
];

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
  validateResendVerification,
  validateTokenRefresh,
  validateSessionRevocation,
  validateUserId,
  validatePagination,
  validateSearch,
  validateDateRange,
  validateString,
  validateEmail,
  validateId,
  handleValidationErrors,
};
