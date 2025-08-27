/**
 * ConversationRoutes - Enhanced conversation management routes
 * Includes visibility management, listing, and comprehensive logging
 */

const express = require("express");
const router = express.Router();
const personaController = require("../controllers/personaController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  validateConversationId,
  validateConversationVisibility,
  validateConversationQuery,
  validateFileUpload,
  validateArchive,
  validateShareLink,
} = require("../middlewares/validationMiddleware");
const { personaLimiter } = require("../middlewares/rateLimiter");
const logger = require("../utils/logger");

// All routes require authentication
const authenticatedOnly = [authMiddleware];

// Helper function to get client information for logging
const getClientInfo = (req) => {
  return {
    ip:
      req.ip ||
      req.connection?.remoteAddress ||
      req.headers["x-forwarded-for"] ||
      "unknown",
    userAgent: req.headers["user-agent"] || "unknown",
    userId: req.user?.id || "unauthenticated",
    traceId: req.headers["x-trace-id"] || "unknown",
    requestId: req.headers["x-request-id"] || "unknown",
  };
};

// GET /api/conversations - List user conversations
router.get(
  "/",
  authenticatedOnly,
  personaLimiter,
  (req, res, next) => {
    try {
      const clientInfo = getClientInfo(req);
      logger.info("GET /api/conversations accessed", { ...clientInfo });
      next();
    } catch (error) {
      const clientInfo = getClientInfo(req);
      logger.error("Error in GET /api/conversations logging", {
        error: error.message,
        ...clientInfo,
      });
      next(error);
    }
  },
  validateConversationQuery,
  personaController.getConversations
);

// GET /api/conversations/:id - Get specific conversation with all messages
router.get(
  "/:id",
  authenticatedOnly,
  personaLimiter,
  (req, res, next) => {
    try {
      const { id } = req.params;
      const clientInfo = getClientInfo(req);
      logger.info("GET /api/conversations/:id accessed", {
        conversationId: id,
        ...clientInfo,
      });
      next();
    } catch (error) {
      const clientInfo = getClientInfo(req);
      logger.error("Error in GET /api/conversations/:id logging", {
        error: error.message,
        ...clientInfo,
      });
      next(error);
    }
  },
  personaController.getConversationById
);

// PATCH /api/conversations/:id/visibility - Update conversation visibility
router.patch(
  "/:id/visibility",
  authenticatedOnly,
  personaLimiter,
  (req, res, next) => {
    try {
      const { id } = req.params;
      const { visibility } = req.body;
      const clientInfo = getClientInfo(req);

      logger.info("PATCH /api/conversations/:id/visibility accessed", {
        conversationId: id,
        visibility,
        ...clientInfo,
      });

      next();
    } catch (error) {
      const clientInfo = getClientInfo(req);
      logger.error("Error in PATCH /api/conversations/:id/visibility logging", {
        error: error.message,
        ...clientInfo,
      });
      next(error);
    }
  },
  validateConversationVisibility,
  personaController.updateConversationVisibility
);

// POST /api/conversations/:id/files - Request file upload URL
router.post(
  "/:id/files",
  authenticatedOnly,
  personaLimiter,
  (req, res, next) => {
    try {
      const { id } = req.params;
      const { filename, mimeType, sizeBytes } = req.body;
      const clientInfo = getClientInfo(req);

      logger.info("POST /api/conversations/:id/files accessed", {
        conversationId: id,
        filename,
        mimeType,
        sizeBytes,
        ...clientInfo,
      });

      next();
    } catch (error) {
      const clientInfo = getClientInfo(req);
      logger.error("Error in POST /api/conversations/:id/files logging", {
        error: error.message,
        ...clientInfo,
      });
      next(error);
    }
  },
  validateFileUpload,
  personaController.requestFileUpload
);

// PATCH /api/conversations/:id/archive - Archive or unarchive conversation
router.patch(
  "/:id/archive",
  authenticatedOnly,
  personaLimiter,
  (req, res, next) => {
    try {
      const { id } = req.params;
      const { archived } = req.body;
      const clientInfo = getClientInfo(req);

      logger.info("PATCH /api/conversations/:id/archive accessed", {
        conversationId: id,
        archived,
        ...clientInfo,
      });

      next();
    } catch (error) {
      const clientInfo = getClientInfo(req);
      logger.error("Error in PATCH /api/conversations/:id/archive logging", {
        error: error.message,
        ...clientInfo,
      });
      next(error);
    }
  },
  // validateArchive, // Temporarily removed for debugging
  personaController.toggleArchive
);

// POST /api/conversations/:id/share - Create or refresh shareable link
router.post(
  "/:id/share",
  authenticatedOnly,
  personaLimiter,
  (req, res, next) => {
    try {
      const { id } = req.params;
      const { expiresInDays } = req.body;
      const clientInfo = getClientInfo(req);

      logger.info("POST /api/conversations/:id/share accessed", {
        conversationId: id,
        expiresInDays,
        ...clientInfo,
      });

      next();
    } catch (error) {
      const clientInfo = getClientInfo(req);
      logger.error("Error in POST /api/conversations/:id/share logging", {
        error: error.message,
        ...clientInfo,
      });
      next(error);
    }
  },
  validateShareLink,
  personaController.createShareableLink
);

module.exports = router;
