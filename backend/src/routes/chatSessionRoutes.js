/**
 * ChatSessionRoutes - Simplified chat session routes
 * Provides only the three required endpoints
 */

const express = require("express");
const router = express.Router();
const chatSessionController = require("../controllers/chatSessionController");
const authMiddleware = require("../middlewares/authMiddleware");
const { personaLimiter } = require("../middlewares/rateLimiter");

// All routes require authentication
const authenticatedOnly = [authMiddleware];

// GET /api/chat-sessions - Get user's chat sessions
router.get(
  "/",
  authenticatedOnly,
  personaLimiter,
  chatSessionController.getUserChatSessions
);

// GET /api/chat-sessions/:sessionId - Get specific chat session
router.get(
  "/:sessionId",
  authenticatedOnly,
  personaLimiter,
  chatSessionController.getChatSession
);

// DELETE /api/chat-sessions/:sessionId - Delete chat session
router.delete(
  "/:sessionId",
  authenticatedOnly,
  personaLimiter,
  chatSessionController.deleteChatSession
);

module.exports = router;
