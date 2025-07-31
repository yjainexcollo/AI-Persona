/**
 * PersonaService - Handles global persona management.
 * Personas are accessible by all workspaces and contain AI personality traits.
 *
 * Features:
 * - CRUD operations for personas
 * - Global persona listing (no workspace filtering)
 * - Trait management (tone, expertise, domains)
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
 * Create a new persona (Admin only)
 */
async function createPersona({ name, description, traits }) {
  // Validate required fields
  if (!name || !traits) {
    throw new ApiError(400, "Name and traits are required");
  }

  // Validate traits structure
  if (typeof traits !== "object" || traits === null) {
    throw new ApiError(400, "Traits must be a valid JSON object");
  }

  // Check if persona with same name already exists
  const existingPersona = await prisma.persona.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (existingPersona) {
    throw new ApiError(409, "Persona with this name already exists");
  }

  const persona = await prisma.persona.create({
    data: {
      name,
      description,
      traits,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      traits: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  logger.info(`Created new persona: ${persona.id} (${persona.name})`);
  return persona;
}

/**
 * Update an existing persona (Admin only)
 */
async function updatePersona(personaId, { name, description, traits }) {
  // Check if persona exists
  const existingPersona = await prisma.persona.findUnique({
    where: { id: personaId },
  });

  if (!existingPersona) {
    throw new ApiError(404, "Persona not found");
  }

  // If name is being updated, check for conflicts
  if (name && name !== existingPersona.name) {
    const nameConflict = await prisma.persona.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        id: { not: personaId },
      },
    });

    if (nameConflict) {
      throw new ApiError(409, "Persona with this name already exists");
    }
  }

  // Validate traits if provided
  if (traits && (typeof traits !== "object" || traits === null)) {
    throw new ApiError(400, "Traits must be a valid JSON object");
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (traits !== undefined) updateData.traits = traits;

  const persona = await prisma.persona.update({
    where: { id: personaId },
    data: updateData,
    select: {
      id: true,
      name: true,
      description: true,
      traits: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  logger.info(`Updated persona: ${persona.id} (${persona.name})`);
  return persona;
}

/**
 * Deactivate a persona (Admin only)
 */
async function deactivatePersona(personaId) {
  const persona = await prisma.persona.findUnique({
    where: { id: personaId },
  });

  if (!persona) {
    throw new ApiError(404, "Persona not found");
  }

  if (!persona.isActive) {
    throw new ApiError(400, "Persona is already inactive");
  }

  const updatedPersona = await prisma.persona.update({
    where: { id: personaId },
    data: { isActive: false },
    select: {
      id: true,
      name: true,
      description: true,
      traits: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  logger.info(`Deactivated persona: ${persona.id} (${persona.name})`);
  return updatedPersona;
}

/**
 * Activate a persona (Admin only)
 */
async function activatePersona(personaId) {
  const persona = await prisma.persona.findUnique({
    where: { id: personaId },
  });

  if (!persona) {
    throw new ApiError(404, "Persona not found");
  }

  if (persona.isActive) {
    throw new ApiError(400, "Persona is already active");
  }

  const updatedPersona = await prisma.persona.update({
    where: { id: personaId },
    data: { isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      traits: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  logger.info(`Activated persona: ${persona.id} (${persona.name})`);
  return updatedPersona;
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
  createPersona,
  updatePersona,
  deactivatePersona,
  activatePersona,
  getPersonaStats,
};
