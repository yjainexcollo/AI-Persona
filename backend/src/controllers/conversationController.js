/**
 * ConversationController - Handles HTTP requests for conversation management.
 * Conversations are workspace-scoped user-persona chats.
 *
 * Features:
 * - Create conversations between users and personas
 * - List user's conversations (public and private)
 * - Get conversation details
 * - Toggle conversation public/private status
 * - Browse public conversations
 * - Delete conversations
 */

const conversationService = require("../services/conversationService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

// POST /api/conversations
const createConversation = asyncHandler(async (req, res) => {
  const { personaId } = req.body;
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");
  if (!personaId) throw new ApiError(400, "Persona ID is required");

  const conversation = await conversationService.createConversation({
    userId,
    personaId,
    workspaceId,
  });

  res.status(201).json({
    status: "success",
    message: "Conversation created successfully",
    data: { conversation },
  });
});

// GET /api/conversations
const getUserConversations = asyncHandler(async (req, res) => {
  const { isPublic } = req.query;
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  // Parse isPublic filter if provided
  let isPublicFilter = null;
  if (isPublic !== undefined) {
    isPublicFilter = isPublic === "true";
  }

  const conversations = await conversationService.getUserConversations({
    userId,
    workspaceId,
    isPublic: isPublicFilter,
  });

  res.status(200).json({
    status: "success",
    data: { conversations },
  });
});

// GET /api/conversations/:id
const getConversationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  const conversation = await conversationService.getConversationById({
    conversationId: id,
    userId,
    workspaceId,
  });

  res.status(200).json({
    status: "success",
    data: { conversation },
  });
});

// PUT /api/conversations/:id/toggle-visibility
const toggleConversationVisibility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  const conversation = await conversationService.toggleConversationVisibility({
    conversationId: id,
    userId,
    workspaceId,
  });

  res.status(200).json({
    status: "success",
    message: `Conversation ${
      conversation.isPublic ? "made public" : "made private"
    }`,
    data: { conversation },
  });
});

// GET /api/conversations/public
const getPublicConversations = asyncHandler(async (req, res) => {
  const { skip = 0, take = 20 } = req.query;
  const workspaceId = req.user && req.user.workspaceId;

  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  const result = await conversationService.getPublicConversations({
    workspaceId,
    skip: parseInt(skip),
    take: parseInt(take),
  });

  res.status(200).json({
    status: "success",
    data: {
      conversations: result.conversations,
      total: result.total,
      skip: parseInt(skip),
      take: parseInt(take),
    },
  });
});

// DELETE /api/conversations/:id
const deleteConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  await conversationService.deleteConversation({
    conversationId: id,
    userId,
    workspaceId,
  });

  res.status(200).json({
    status: "success",
    message: "Conversation deleted successfully",
  });
});

module.exports = {
  createConversation,
  getUserConversations,
  getConversationById,
  toggleConversationVisibility,
  getPublicConversations,
  deleteConversation,
};
