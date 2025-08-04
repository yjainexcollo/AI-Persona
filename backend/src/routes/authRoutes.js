/**
 * AuthRoutes - Enhanced authentication routes
 * Includes account lifecycle, security features, and audit logging
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const oauthController = require("../controllers/oauthController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  validateRegistration,
  validateLogin,
  validateTokenRefresh,
  validateEmailVerification,
  validateResendVerification,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateSessionRevocation,
} = require("../middlewares/validationMiddleware");
const rateLimit = require("express-rate-limit");

// Rate limiting configurations
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour per IP
  message: "Too many registration attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes per IP
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour per IP
  message: "Too many verification resend attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour per IP
  message: "Too many password reset attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (no authentication required)
router.post(
  "/register",
  registerLimiter,
  validateRegistration,
  authController.register
);
router.post("/login", loginLimiter, validateLogin, authController.login);
router.post("/refresh", validateTokenRefresh, authController.refreshTokens);

// Email verification routes
router.get(
  "/verify-email",
  validateEmailVerification,
  authController.verifyEmail
);
router.post(
  "/resend-verification",
  resendVerificationLimiter,
  validateResendVerification,
  authController.resendVerification
);

// Password reset routes
router.post(
  "/request-password-reset",
  passwordResetLimiter,
  validatePasswordResetRequest,
  authController.requestPasswordReset
);
router.post(
  "/reset-password",
  validatePasswordReset,
  authController.resetPassword
);

// Health check
router.get("/health", authController.healthCheck);

// JWKS endpoint (public)
router.get("/.well-known/jwks.json", authController.getJWKS);

// Protected routes (authentication required)
const authenticatedOnly = [authMiddleware];

// Session management
router.get("/sessions", ...authenticatedOnly, authController.getUserSessions);
router.delete(
  "/sessions/:sessionId",
  ...authenticatedOnly,
  validateSessionRevocation,
  authController.revokeSession
);

// Authentication management
router.post("/logout", ...authenticatedOnly, authController.logout);

// Account management
router.post(
  "/deactivate",
  ...authenticatedOnly,
  authController.deactivateAccount
);
router.post(
  "/delete-account",
  ...authenticatedOnly,
  authController.requestAccountDeletion
);

// Key rotation (admin only)
router.post("/rotate-keys", ...authenticatedOnly, authController.rotateKeys);

// OAuth routes
router.get("/google", oauthController.googleAuth);
router.get("/google/callback", oauthController.googleCallback);

module.exports = router;
