const express = require("express");
const router = express.Router();
const personaController = require("../controllers/personaController");
const authMiddleware = require("../middlewares/authMiddleware");

// All persona routes require authentication
const authenticatedOnly = [authMiddleware];

// Get all personas
router.get("/", ...authenticatedOnly, personaController.getAllPersonas);

// Get persona by ID
router.get("/:id", ...authenticatedOnly, personaController.getPersonaById);

// Get persona statistics
router.get("/stats", ...authenticatedOnly, personaController.getPersonaStats);

module.exports = router;
