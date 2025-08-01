/**
 * MessageService - Handles user-persona chat messages like ChatGPT/Claude.
 * Simple back-and-forth conversation without complex features.
 *
 * Features:
 * - Send user message
 * - Send persona response
 * - Get conversation messages
 * - Simple reactions on persona responses
 */

const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");
const ApiError = require("../utils/apiError");

const prisma = new PrismaClient();

/**
 * Send a user message in a conversation
 */
async function sendUserMessage({ conversationId, userId, content }) {
  // Validate conversation exists and user has access
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Message content is required");
  }

  // Create the user message
  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      conversationId,
      userId,
      isFromUser: true, // User message
    },
    select: {
      id: true,
      content: true,
      conversationId: true,
      userId: true,
      isFromUser: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Update conversation message count and last message time
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      messageCount: {
        increment: 1,
      },
      lastMessageAt: new Date(),
    },
  });

  logger.info(
    `User message sent: ${message.id} in conversation ${conversationId}`
  );
  return message;
}

/**
 * Send a persona response in a conversation
 */
async function sendPersonaResponse({ conversationId, userId, content }) {
  // Validate conversation exists and user has access
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Response content is required");
  }

  // Create the persona response
  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      conversationId,
      userId,
      isFromUser: false, // Persona response
    },
    select: {
      id: true,
      content: true,
      conversationId: true,
      userId: true,
      isFromUser: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Update conversation message count and last message time
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      messageCount: {
        increment: 1,
      },
      lastMessageAt: new Date(),
    },
  });

  logger.info(
    `Persona response sent: ${message.id} in conversation ${conversationId}`
  );
  return message;
}

/**
 * Get all messages in a conversation (like ChatGPT history)
 */
async function getConversationMessages({ conversationId, userId }) {
  // Validate conversation exists and user has access
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    select: {
      id: true,
      content: true,
      conversationId: true,
      userId: true,
      isFromUser: true,
      createdAt: true,
      updatedAt: true,
      reactions: {
        select: {
          id: true,
          type: true,
          userId: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "asc" }, // Chronological order like ChatGPT
  });

  logger.info(
    `Retrieved ${messages.length} messages from conversation ${conversationId}`
  );
  return { messages };
}

/**
 * Add reaction to a persona response (like/dislike)
 */
async function addReaction({ messageId, userId, type }) {
  // Validate message exists and user has access
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      conversation: {
        userId,
      },
      isFromUser: false, // Only react to persona responses
    },
  });

  if (!message) {
    throw new ApiError(404, "Persona message not found");
  }

  // Validate reaction type
  if (!["LIKE", "DISLIKE"].includes(type)) {
    throw new ApiError(400, "Invalid reaction type. Must be LIKE or DISLIKE");
  }

  // Check if user already reacted to this message
  const existingReaction = await prisma.reaction.findUnique({
    where: {
      messageId_userId: {
        messageId,
        userId,
      },
    },
  });

  if (existingReaction) {
    // Update existing reaction
    const reaction = await prisma.reaction.update({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      data: { type },
      select: {
        id: true,
        messageId: true,
        userId: true,
        type: true,
        createdAt: true,
      },
    });

    logger.info(
      `Updated reaction: ${reaction.id} on message ${messageId} by user ${userId}`
    );
    return reaction;
  } else {
    // Create new reaction
    const reaction = await prisma.reaction.create({
      data: {
        messageId,
        userId,
        type,
      },
      select: {
        id: true,
        messageId: true,
        userId: true,
        type: true,
        createdAt: true,
      },
    });

    logger.info(
      `Added reaction: ${reaction.id} on message ${messageId} by user ${userId}`
    );
    return reaction;
  }
}

/**
 * Remove reaction from a message
 */
async function removeReaction({ messageId, userId }) {
  // Validate message exists and user has access
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      conversation: {
        userId,
      },
    },
  });

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  const reaction = await prisma.reaction.findUnique({
    where: {
      messageId_userId: {
        messageId,
        userId,
      },
    },
  });

  if (!reaction) {
    throw new ApiError(404, "Reaction not found");
  }

  await prisma.reaction.delete({
    where: {
      messageId_userId: {
        messageId,
        userId,
      },
    },
  });

  logger.info(`Removed reaction on message ${messageId} by user ${userId}`);
  return { success: true };
}

module.exports = {
  sendUserMessage,
  sendPersonaResponse,
  getConversationMessages,
  addReaction,
  removeReaction,
};
