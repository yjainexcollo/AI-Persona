/**
 * PersonaController - Handles HTTP requests for persona management.
 * Read-only operations for global personas accessible by all workspaces.
 *
 * Features:
 * - List all active personas
 * - Get persona by ID
 * - Get persona statistics
 */

const personaService = require("../services/personaService");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/personas
const getAllPersonas = asyncHandler(async (req, res) => {
  const personas = await personaService.getAllPersonas();
  res.status(200).json({
    status: "success",
    data: { personas },
  });
});

// GET /api/personas/:id
const getPersonaById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const persona = await personaService.getPersonaById(id);
  res.status(200).json({
    status: "success",
    data: { persona },
  });
});

// GET /api/personas/stats
const getPersonaStats = asyncHandler(async (req, res) => {
  const stats = await personaService.getPersonaStats();
  res.status(200).json({
    status: "success",
    data: stats,
  });
});

module.exports = {
  getAllPersonas,
  getPersonaById,
  getPersonaStats,
};
