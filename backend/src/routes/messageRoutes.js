const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const authMiddleware = require("../middlewares/authMiddleware");

// All message routes require authentication
const authenticatedOnly = [authMiddleware];

// Send user message
router.post("/", ...authenticatedOnly, messageController.sendUserMessage);

// Send persona response
router.post(
  "/response",
  ...authenticatedOnly,
  messageController.sendPersonaResponse
);

// Add reaction to message
router.post(
  "/:messageId/reactions",
  ...authenticatedOnly,
  messageController.addReaction
);

// Remove reaction from message
router.delete(
  "/:messageId/reactions",
  ...authenticatedOnly,
  messageController.removeReaction
);

module.exports = router;
