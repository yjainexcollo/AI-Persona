/**
 * ConversationService - Handles user-persona conversations.
 * Conversations are workspace-scoped and allow users to chat with personas.
 *
 * Features:
 * - Create conversations between users and personas
 * - List user's conversations (public and private)
 * - Get conversation details with messages
 * - Toggle conversation public/private status
 * - Workspace-scoped operations
 * - Message count tracking
 */

const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");
const ApiError = require("../utils/apiError");

const prisma = new PrismaClient();

/**
 * Create a new conversation between user and persona
 */
async function createConversation({ userId, personaId, workspaceId }) {
  // Validate that persona exists and is active
  const persona = await prisma.persona.findUnique({
    where: { id: personaId },
  });

  if (!persona) {
    throw new ApiError(404, "Persona not found");
  }

  if (!persona.isActive) {
    throw new ApiError(400, "Persona is inactive");
  }

  // Check if conversation already exists
  const existingConversation = await prisma.conversation.findUnique({
    where: {
      userId_personaId: {
        userId,
        personaId,
      },
    },
  });

  if (existingConversation) {
    throw new ApiError(
      409,
      "Conversation already exists between user and persona"
    );
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      userId,
      personaId,
      workspaceId,
      isPublic: false, // Default to private
      messageCount: 0,
    },
    select: {
      id: true,
      userId: true,
      personaId: true,
      workspaceId: true,
      isPublic: true,
      messageCount: true,
      lastMessageAt: true,
      createdAt: true,
      updatedAt: true,
      persona: {
        select: {
          id: true,
          name: true,
          description: true,
          persona_id: true,
        },
      },
    },
  });

  logger.info(
    `Created conversation: ${conversation.id} between user ${userId} and persona ${personaId}`
  );
  return conversation;
}

/**
 * Get user's conversations (workspace-scoped)
 */
async function getUserConversations({ userId, workspaceId, isPublic = null }) {
  const where = {
    userId,
    workspaceId,
  };

  // Filter by public/private status if specified
  if (isPublic !== null) {
    where.isPublic = isPublic;
  }

  const conversations = await prisma.conversation.findMany({
    where,
    select: {
      id: true,
      userId: true,
      personaId: true,
      workspaceId: true,
      isPublic: true,
      messageCount: true,
      lastMessageAt: true,
      createdAt: true,
      updatedAt: true,
      persona: {
        select: {
          id: true,
          name: true,
          description: true,
          persona_id: true,
        },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  logger.info(
    `Retrieved ${conversations.length} conversations for user ${userId} in workspace ${workspaceId}`
  );
  return conversations;
}

/**
 * Get conversation by ID (workspace-scoped)
 */
async function getConversationById({ conversationId, userId, workspaceId }) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
      workspaceId,
    },
    select: {
      id: true,
      userId: true,
      personaId: true,
      workspaceId: true,
      isPublic: true,
      messageCount: true,
      lastMessageAt: true,
      createdAt: true,
      updatedAt: true,
      persona: {
        select: {
          id: true,
          name: true,
          description: true,
          persona_id: true,
        },
      },
    },
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  return conversation;
}

/**
 * Toggle conversation public/private status
 */
async function toggleConversationVisibility({
  conversationId,
  userId,
  workspaceId,
}) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
      workspaceId,
    },
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const updatedConversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: { isPublic: !conversation.isPublic },
    select: {
      id: true,
      userId: true,
      personaId: true,
      workspaceId: true,
      isPublic: true,
      messageCount: true,
      lastMessageAt: true,
      createdAt: true,
      updatedAt: true,
      persona: {
        select: {
          id: true,
          name: true,
          description: true,
          persona_id: true,
        },
      },
    },
  });

  logger.info(
    `Toggled conversation ${conversationId} visibility to ${
      updatedConversation.isPublic ? "public" : "private"
    }`
  );
  return updatedConversation;
}

/**
 * Get public conversations in workspace
 */
async function getPublicConversations({ workspaceId, skip = 0, take = 20 }) {
  const conversations = await prisma.conversation.findMany({
    where: {
      workspaceId,
      isPublic: true,
    },
    select: {
      id: true,
      userId: true,
      personaId: true,
      workspaceId: true,
      isPublic: true,
      messageCount: true,
      lastMessageAt: true,
      createdAt: true,
      updatedAt: true,
      persona: {
        select: {
          id: true,
          name: true,
          description: true,
          persona_id: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { lastMessageAt: "desc" },
    skip,
    take,
  });

  const total = await prisma.conversation.count({
    where: {
      workspaceId,
      isPublic: true,
    },
  });

  return { conversations, total };
}

/**
 * Delete conversation (workspace-scoped)
 */
async function deleteConversation({ conversationId, userId, workspaceId }) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
      workspaceId,
    },
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  await prisma.conversation.delete({
    where: { id: conversationId },
  });

  logger.info(`Deleted conversation: ${conversationId} by user ${userId}`);
  return { success: true };
}

module.exports = {
  createConversation,
  getUserConversations,
  getConversationById,
  toggleConversationVisibility,
  getPublicConversations,
  deleteConversation,
};
