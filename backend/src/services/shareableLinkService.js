/**
 * ShareableLinkService - Handles shareable link management for conversations.
 * Allows users to create public, shareable links for their conversations.
 *
 * Features:
 * - Create shareable links for conversations
 * - Get conversation by shareable link
 * - List user's shareable links
 * - Delete shareable links
 * - Public access to conversations via links
 * - Workspace-scoped operations
 */

const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");
const ApiError = require("../utils/apiError");
const crypto = require("crypto");

const prisma = new PrismaClient();

/**
 * Generate a unique token for shareable link
 */
function generateUniqueToken() {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Create a shareable link for a conversation
 */
async function createShareableLink({ conversationId, userId, workspaceId }) {
  // Validate that conversation exists and user has access
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

  // Check if shareable link already exists for this conversation
  const existingLink = await prisma.shareableLink.findUnique({
    where: { conversationId },
  });

  if (existingLink) {
    throw new ApiError(
      409,
      "Shareable link already exists for this conversation"
    );
  }

  // Generate unique token
  const token = generateUniqueToken();

  // Create shareable link
  const shareableLink = await prisma.shareableLink.create({
    data: {
      conversationId,
      token,
      createdBy: userId,
      workspaceId,
    },
    select: {
      id: true,
      conversationId: true,
      token: true,
      createdBy: true,
      workspaceId: true,
      createdAt: true,
      conversation: {
        select: {
          id: true,
          isPublic: true,
          messageCount: true,
          persona: {
            select: {
              id: true,
              name: true,
              description: true,
              persona_id: true,
            },
          },
        },
      },
    },
  });

  logger.info(
    `Created shareable link: ${shareableLink.id} for conversation ${conversationId}`
  );
  return shareableLink;
}

/**
 * Get conversation by shareable link token
 */
async function getConversationByToken({ token }) {
  const shareableLink = await prisma.shareableLink.findUnique({
    where: { token },
    select: {
      id: true,
      conversationId: true,
      token: true,
      createdAt: true,
      conversation: {
        select: {
          id: true,
          isPublic: true,
          messageCount: true,
          createdAt: true,
          updatedAt: true,
          persona: {
            select: {
              id: true,
              name: true,
              description: true,
              persona_id: true,
              traits: true,
            },
          },
          messages: {
            select: {
              id: true,
              content: true,
              isFromUser: true,
              createdAt: true,
              reactions: {
                select: {
                  id: true,
                  type: true,
                  createdAt: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!shareableLink) {
    throw new ApiError(404, "Shareable link not found or invalid");
  }

  // Check if conversation is public (required for shareable links)
  if (!shareableLink.conversation.isPublic) {
    throw new ApiError(403, "This conversation is not publicly accessible");
  }

  logger.info(`Accessed conversation via shareable link: ${token}`);
  return shareableLink;
}

/**
 * Get user's shareable links
 */
async function getUserShareableLinks({ userId, workspaceId }) {
  const shareableLinks = await prisma.shareableLink.findMany({
    where: {
      createdBy: userId,
      workspaceId,
    },
    select: {
      id: true,
      conversationId: true,
      token: true,
      createdAt: true,
      conversation: {
        select: {
          id: true,
          isPublic: true,
          messageCount: true,
          persona: {
            select: {
              id: true,
              name: true,
              description: true,
              persona_id: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  logger.info(
    `Retrieved ${shareableLinks.length} shareable links for user ${userId}`
  );
  return shareableLinks;
}

/**
 * Get shareable link by ID (for user's own links)
 */
async function getShareableLinkById({ linkId, userId, workspaceId }) {
  const shareableLink = await prisma.shareableLink.findFirst({
    where: {
      id: linkId,
      createdBy: userId,
      workspaceId,
    },
    select: {
      id: true,
      conversationId: true,
      token: true,
      createdAt: true,
      conversation: {
        select: {
          id: true,
          isPublic: true,
          messageCount: true,
          persona: {
            select: {
              id: true,
              name: true,
              description: true,
              persona_id: true,
            },
          },
        },
      },
    },
  });

  if (!shareableLink) {
    throw new ApiError(404, "Shareable link not found");
  }

  return shareableLink;
}

/**
 * Delete shareable link
 */
async function deleteShareableLink({ linkId, userId, workspaceId }) {
  // Check if shareable link exists and user owns it
  const shareableLink = await prisma.shareableLink.findFirst({
    where: {
      id: linkId,
      createdBy: userId,
      workspaceId,
    },
  });

  if (!shareableLink) {
    throw new ApiError(404, "Shareable link not found");
  }

  // Delete shareable link
  await prisma.shareableLink.delete({
    where: { id: linkId },
  });

  logger.info(`Deleted shareable link: ${linkId}`);
  return { success: true };
}

/**
 * Get shareable link statistics
 */
async function getShareableLinkStats({ userId, workspaceId }) {
  const stats = await prisma.shareableLink.aggregate({
    where: {
      createdBy: userId,
      workspaceId,
    },
    _count: {
      id: true,
    },
  });

  return {
    totalLinks: stats._count.id,
  };
}

module.exports = {
  createShareableLink,
  getConversationByToken,
  getUserShareableLinks,
  getShareableLinkById,
  deleteShareableLink,
  getShareableLinkStats,
};
