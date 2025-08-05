/**
 * PublicRoutes - Public endpoints that don't require authentication
 * Includes shared conversation links and other public features
 */

const express = require("express");
const router = express.Router();
const personaController = require("../controllers/personaController");
const { validateSharedToken } = require("../middlewares/validationMiddleware");

// GET /p/:token - Get shared conversation (public)
router.get(
  "/:token",
  validateSharedToken,
  personaController.getSharedConversation
);

module.exports = router;
