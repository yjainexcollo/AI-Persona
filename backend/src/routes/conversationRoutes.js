/**
 * ConversationRoutes - Conversation management routes
 * Includes visibility management and listing
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

// All routes require authentication
const authenticatedOnly = [authMiddleware];

// GET /api/conversations - List user conversations
router.get(
  "/",
  authenticatedOnly,
  personaLimiter,
  validateConversationQuery,
  personaController.getConversations
);

// PATCH /api/conversations/:id/visibility - Update conversation visibility
router.patch(
  "/:id/visibility",
  authenticatedOnly,
  personaLimiter,
  validateConversationVisibility,
  personaController.updateConversationVisibility
);

// POST /api/conversations/:id/files - Request file upload URL
router.post(
  "/:id/files",
  authenticatedOnly,
  personaLimiter,
  validateFileUpload,
  personaController.requestFileUpload
);

// PATCH /api/conversations/:id/archive - Archive or unarchive conversation
router.patch(
  "/:id/archive",
  authenticatedOnly,
  personaLimiter,
  validateArchive,
  personaController.toggleArchive
);

// POST /api/conversations/:id/share - Create or refresh shareable link
router.post(
  "/:id/share",
  authenticatedOnly,
  personaLimiter,
  validateShareLink,
  personaController.createShareableLink
);

module.exports = router;
