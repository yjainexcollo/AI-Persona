/**
 * MessageRoutes - Message editing routes
 * Includes message editing and conversation branching
 */

const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  validateMessageEdit,
  validateReaction,
} = require("../middlewares/validationMiddleware");
const { personaLimiter } = require("../middlewares/rateLimiter");

// All routes require authentication
const authenticatedOnly = [authMiddleware];

// PATCH /api/messages/:id - Edit message
router.patch(
  "/:id",
  authenticatedOnly,
  personaLimiter,
  validateMessageEdit,
  messageController.editMessage
);

// POST /api/messages/:id/reactions - Toggle message reaction
router.post(
  "/:id/reactions",
  authenticatedOnly,
  personaLimiter,
  validateReaction,
  messageController.toggleReaction
);

module.exports = router;
