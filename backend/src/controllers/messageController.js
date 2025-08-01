/**
 * MessageController - Handles HTTP requests for user-persona chat messages.
 * Simple ChatGPT/Claude-like conversation interface.
 *
 * Features:
 * - Send user messages
 * - Send persona responses
 * - Get conversation chat history
 * - Add/remove reactions on persona responses
 */

const messageService = require("../services/messageService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

// POST /api/messages
const sendUserMessage = asyncHandler(async (req, res) => {
  const { conversationId, content } = req.body;
  const userId = req.user && req.user.id;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!conversationId) throw new ApiError(400, "Conversation ID is required");
  if (!content) throw new ApiError(400, "Message content is required");

  const message = await messageService.sendUserMessage({
    conversationId,
    userId,
    content,
  });

  res.status(201).json({
    status: "success",
    message: "Message sent successfully",
    data: { message },
  });
});

// POST /api/messages/response
const sendPersonaResponse = asyncHandler(async (req, res) => {
  const { conversationId, content } = req.body;
  const userId = req.user && req.user.id;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!conversationId) throw new ApiError(400, "Conversation ID is required");
  if (!content) throw new ApiError(400, "Response content is required");

  const message = await messageService.sendPersonaResponse({
    conversationId,
    userId,
    content,
  });

  res.status(201).json({
    status: "success",
    message: "Persona response sent successfully",
    data: { message },
  });
});

// GET /api/conversations/:conversationId/messages
const getConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user && req.user.id;

  if (!userId) throw new ApiError(401, "Authentication required");

  const result = await messageService.getConversationMessages({
    conversationId,
    userId,
  });

  res.status(200).json({
    status: "success",
    data: { messages: result.messages },
  });
});

// POST /api/messages/:messageId/reactions
const addReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { type } = req.body;
  const userId = req.user && req.user.id;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!type) throw new ApiError(400, "Reaction type is required");

  const reaction = await messageService.addReaction({
    messageId,
    userId,
    type,
  });

  res.status(200).json({
    status: "success",
    message: "Reaction added successfully",
    data: { reaction },
  });
});

// DELETE /api/messages/:messageId/reactions
const removeReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user && req.user.id;

  if (!userId) throw new ApiError(401, "Authentication required");

  await messageService.removeReaction({
    messageId,
    userId,
  });

  res.status(200).json({
    status: "success",
    message: "Reaction removed successfully",
  });
});

module.exports = {
  sendUserMessage,
  sendPersonaResponse,
  getConversationMessages,
  addReaction,
  removeReaction,
};
