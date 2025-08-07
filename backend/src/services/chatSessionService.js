/**
 * ChatSessionService - Simplified chat session management
 * Provides only the essential functions for the three required endpoints
 */

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

const prisma = new PrismaClient();

/**
 * Create a new chat session for a user message
 * @param {string} conversationId - Conversation ID
 * @param {string} personaId - Persona ID
 * @param {string} userId - User ID
 * @param {object} metadata - Additional session metadata
 * @returns {Promise<object>} Created chat session
 */
async function createChatSession(
  conversationId,
  personaId,
  userId,
  metadata = {}
) {
  try {
    // Generate unique session ID
    const sessionId = crypto.randomBytes(16).toString("hex");

    // Create chat session
    const chatSession = await prisma.chatSession.create({
      data: {
        conversationId,
        personaId,
        userId,
        sessionId,
        metadata: {
          userAgent: metadata.userAgent,
          ipAddress: metadata.ipAddress,
          deviceInfo: metadata.deviceInfo,
          ...metadata,
        },
      },
      include: {
        conversation: true,
        persona: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    logger.info(
      `Chat session created: ${sessionId} for conversation ${conversationId}`
    );

    return chatSession;
  } catch (error) {
    logger.error("Error creating chat session:", error);
    throw new ApiError(500, "Failed to create chat session");
  }
}

/**
 * Get chat session by session ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<object>} Chat session
 */
async function getChatSession(sessionId) {
  try {
    const chatSession = await prisma.chatSession.findUnique({
      where: { sessionId },
      include: {
        conversation: true,
        persona: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!chatSession) {
      throw new ApiError(404, "Chat session not found");
    }

    return chatSession;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error("Error getting chat session:", error);
    throw new ApiError(500, "Failed to get chat session");
  }
}

/**
 * Get chat sessions for a user
 * @param {string} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise<Array>} Chat sessions
 */
async function getUserChatSessions(userId, options = {}) {
  try {
    const { status, limit = 50, offset = 0 } = options;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const chatSessions = await prisma.chatSession.findMany({
      where,
      include: {
        conversation: true,
        persona: true,
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
      take: limit,
      skip: offset,
    });

    return chatSessions;
  } catch (error) {
    logger.error("Error getting user chat sessions:", error);
    throw new ApiError(500, "Failed to get user chat sessions");
  }
}

/**
 * Delete a chat session and all associated messages
 * @param {string} sessionId - Session ID
 * @param {string} userId - User ID for ownership verification
 * @returns {Promise<object>} Deletion result
 */
async function deleteChatSession(sessionId, userId) {
  try {
    // Get session and verify ownership
    const chatSession = await prisma.chatSession.findUnique({
      where: { sessionId },
      include: {
        messages: true,
      },
    });

    if (!chatSession) {
      throw new ApiError(404, "Chat session not found");
    }

    if (chatSession.userId !== userId) {
      throw new ApiError(403, "You can only delete your own chat sessions");
    }

    // Delete session and all associated messages
    await prisma.$transaction(async (tx) => {
      // Delete all messages in this session
      await tx.message.deleteMany({
        where: { chatSessionId: chatSession.id },
      });

      // Delete the session
      await tx.chatSession.delete({
        where: { id: chatSession.id },
      });
    });

    logger.info(`Chat session ${sessionId} deleted by user ${userId}`);

    return {
      sessionId,
      deletedAt: new Date(),
      messageCount: chatSession.messages.length,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error("Error deleting chat session:", error);
    throw new ApiError(500, "Failed to delete chat session");
  }
}

module.exports = {
  createChatSession,
  getChatSession,
  getUserChatSessions,
  deleteChatSession,
};
