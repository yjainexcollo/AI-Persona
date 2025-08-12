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
    // Validate required parameters
    if (!conversationId || !personaId || !userId) {
      throw new ApiError(
        400,
        "Missing required parameters: conversationId, personaId, or userId"
      );
    }

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
          deviceInfo: metadata.deviceInfo ?? null,
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
    if (error instanceof ApiError) throw error;
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
    // Validate required parameter
    if (!sessionId) {
      throw new ApiError(400, "Missing required parameter: sessionId");
    }

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
 * Update a chat session's status and timestamps
 * @param {string} sessionId - Session ID
 * @param {"ACTIVE"|"COMPLETED"|"FAILED"|"TIMEOUT"} status - New status
 * @param {string|null} errorMessage - Optional error message
 * @returns {Promise<object>} Updated chat session
 */
async function updateChatSessionStatus(sessionId, status, errorMessage = null) {
  try {
    // Validate required parameters
    if (!sessionId || !status) {
      throw new ApiError(
        400,
        "Missing required parameters: sessionId or status"
      );
    }

    // Validate status enum
    const validStatuses = [
      "ACTIVE",
      "COMPLETED",
      "FAILED",
      "TIMEOUT",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      throw new ApiError(
        400,
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    const now = new Date();
    const isTerminal =
      status === "COMPLETED" ||
      status === "FAILED" ||
      status === "TIMEOUT" ||
      status === "CANCELLED";

    const chatSession = await prisma.chatSession.update({
      where: { sessionId },
      data: {
        status,
        lastActivityAt: now,
        endedAt: isTerminal ? now : undefined,
        ...(status === "FAILED" && errorMessage ? { errorMessage } : {}),
      },
      include: {
        conversation: true,
        persona: true,
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return chatSession;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error("Error updating chat session status:", error);
    throw new ApiError(500, "Failed to update chat session status");
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
    // Validate required parameter
    if (!userId) {
      throw new ApiError(400, "Missing required parameter: userId");
    }

    const { status, limit = 50, offset = 0 } = options;

    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      throw new ApiError(400, "Limit must be between 1 and 100");
    }
    if (offset < 0) {
      throw new ApiError(400, "Offset must be non-negative");
    }

    const where = { userId };
    if (status) {
      // Validate status if provided
      const validStatuses = [
        "ACTIVE",
        "COMPLETED",
        "FAILED",
        "TIMEOUT",
        "CANCELLED",
      ];
      if (!validStatuses.includes(status)) {
        throw new ApiError(
          400,
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }
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
    if (error instanceof ApiError) throw error;
    logger.error("Error getting user chat sessions:", error);
    throw new ApiError(500, "Failed to get user chat sessions");
  }
}

/**
 * Mark sessions as timed out if inactive beyond the provided hours
 * @param {number} inactiveHours - Hours of inactivity threshold
 * @returns {Promise<number>} Number of sessions updated
 */
async function cleanupExpiredSessions(inactiveHours = 24) {
  try {
    const cutoff = new Date(Date.now() - inactiveHours * 60 * 60 * 1000);
    const result = await prisma.chatSession.updateMany({
      where: {
        status: "ACTIVE",
        lastActivityAt: { lt: cutoff },
      },
      data: {
        status: "TIMEOUT",
        endedAt: new Date(),
        errorMessage: "Session timed out due to inactivity",
      },
    });

    return result.count;
  } catch (error) {
    logger.error("Error cleaning up expired chat sessions:", error);
    throw new ApiError(500, "Failed to cleanup expired chat sessions");
  }
}

/**
 * Get chat session statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<{ total: number, active: number, byStatus: Record<string, number> }>} Stats
 */
async function getChatSessionStats(userId) {
  try {
    const [byStatusRaw, total, active] = await Promise.all([
      prisma.chatSession.groupBy({
        by: ["status"],
        where: { userId },
        _count: { id: true },
      }),
      prisma.chatSession.count({ where: { userId } }),
      prisma.chatSession.count({ where: { userId, status: "ACTIVE" } }),
    ]);

    const byStatus = {};
    for (const row of byStatusRaw) {
      byStatus[row.status] = row._count.id;
    }

    return { total, active, byStatus };
  } catch (error) {
    logger.error("Error getting chat session stats:", error);
    throw new ApiError(500, "Failed to get chat session stats");
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
  updateChatSessionStatus,
  cleanupExpiredSessions,
  getChatSessionStats,
  deleteChatSession,
};
