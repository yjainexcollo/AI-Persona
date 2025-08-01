/**
 * PersonaService - Handles global persona management.
 * Personas are accessible by all workspaces and contain AI personality traits.
 *
 * Features:
 * - Read-only operations for personas (CRUD handled externally)
 * - Global persona listing (no workspace filtering)
 * - persona_id for webhook identification
 * - Active/inactive persona management
 */

const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");
const ApiError = require("../utils/apiError");

const prisma = new PrismaClient();

/**
 * Get all active personas (global - accessible by all workspaces)
 */
async function getAllPersonas() {
  const personas = await prisma.persona.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      traits: true,
      persona_id: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { name: "asc" },
  });

  logger.info(`Retrieved ${personas.length} active personas`);
  return personas;
}

/**
 * Get a specific persona by ID
 */
async function getPersonaById(personaId) {
  const persona = await prisma.persona.findUnique({
    where: { id: personaId },
    select: {
      id: true,
      name: true,
      description: true,
      traits: true,
      persona_id: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!persona) {
    throw new ApiError(404, "Persona not found");
  }

  if (!persona.isActive) {
    throw new ApiError(400, "Persona is inactive");
  }

  return persona;
}

/**
 * Get persona statistics
 */
async function getPersonaStats() {
  const [totalPersonas, activePersonas, inactivePersonas] = await Promise.all([
    prisma.persona.count(),
    prisma.persona.count({ where: { isActive: true } }),
    prisma.persona.count({ where: { isActive: false } }),
  ]);

  return {
    total: totalPersonas,
    active: activePersonas,
    inactive: inactivePersonas,
  };
}

module.exports = {
  getAllPersonas,
  getPersonaById,
  getPersonaStats,
};
