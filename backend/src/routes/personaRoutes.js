/**
 * PersonaRoutes - Persona management and chat functionality routes
 * Includes rate limiting, validation, and authentication
 */

const express = require("express");
const router = express.Router();
const personaController = require("../controllers/personaController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  validatePersonaId,
  validateChatMessage,
  validateFavouriteToggle,
} = require("../middlewares/validationMiddleware");
const { chatLimiter, personaLimiter } = require("../middlewares/rateLimiter");

// All routes require authentication
const authenticatedOnly = [authMiddleware];

// GET /api/personas - List all personas
router.get(
  "/",
  authenticatedOnly,
  personaLimiter,
  personaController.getPersonas
);

// GET /api/personas/:id - Get persona details
router.get(
  "/:id",
  authenticatedOnly,
  personaLimiter,
  validatePersonaId,
  personaController.getPersonaById
);

// POST /api/personas/:id/favourite - Toggle favourite
router.post(
  "/:id/favourite",
  authenticatedOnly,
  personaLimiter,
  validateFavouriteToggle,
  personaController.toggleFavourite
);

// POST /api/personas/:id/chat - Send message
router.post(
  "/:id/chat",
  authenticatedOnly,
  chatLimiter,
  validateChatMessage,
  personaController.sendMessage
);

module.exports = router;
