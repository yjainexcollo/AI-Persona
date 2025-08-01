const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversationController");
const authMiddleware = require("../middlewares/authMiddleware");

// All conversation routes require authentication
const authenticatedOnly = [authMiddleware];

// Create new conversation
router.post(
  "/",
  ...authenticatedOnly,
  conversationController.createConversation
);

// Get user's conversations (with optional isPublic filter)
router.get(
  "/",
  ...authenticatedOnly,
  conversationController.getUserConversations
);

// Get public conversations in workspace (with pagination)
router.get(
  "/public",
  ...authenticatedOnly,
  conversationController.getPublicConversations
);

// Get specific conversation by ID
router.get(
  "/:id",
  ...authenticatedOnly,
  conversationController.getConversationById
);

// Toggle conversation visibility (public/private)
router.put(
  "/:id/toggle-visibility",
  ...authenticatedOnly,
  conversationController.toggleConversationVisibility
);

// Delete conversation
router.delete(
  "/:id",
  ...authenticatedOnly,
  conversationController.deleteConversation
);

module.exports = router;
