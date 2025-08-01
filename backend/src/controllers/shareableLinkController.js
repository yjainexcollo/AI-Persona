/**
 * ShareableLinkController - Handles HTTP requests for shareable link management.
 * Provides RESTful endpoints for creating, managing, and accessing shareable links.
 */

const shareableLinkService = require("../services/shareableLinkService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

// POST /api/shareable-links
const createShareableLink = asyncHandler(async (req, res) => {
  const { conversationId } = req.body;
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");
  if (!conversationId) throw new ApiError(400, "Conversation ID is required");

  const shareableLink = await shareableLinkService.createShareableLink({
    conversationId,
    userId,
    workspaceId,
  });

  res.status(201).json({
    status: "success",
    message: "Shareable link created successfully",
    data: { shareableLink },
  });
});

// GET /api/shareable-links
const getUserShareableLinks = asyncHandler(async (req, res) => {
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  const shareableLinks = await shareableLinkService.getUserShareableLinks({
    userId,
    workspaceId,
  });

  res.status(200).json({
    status: "success",
    message: "Shareable links retrieved successfully",
    data: { shareableLinks },
  });
});

// GET /api/shareable-links/:id
const getShareableLinkById = asyncHandler(async (req, res) => {
  const { id: linkId } = req.params;
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");
  if (!linkId) throw new ApiError(400, "Link ID is required");

  const shareableLink = await shareableLinkService.getShareableLinkById({
    linkId,
    userId,
    workspaceId,
  });

  res.status(200).json({
    status: "success",
    message: "Shareable link retrieved successfully",
    data: { shareableLink },
  });
});

// DELETE /api/shareable-links/:id
const deleteShareableLink = asyncHandler(async (req, res) => {
  const { id: linkId } = req.params;
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");
  if (!linkId) throw new ApiError(400, "Link ID is required");

  await shareableLinkService.deleteShareableLink({
    linkId,
    userId,
    workspaceId,
  });

  res.status(200).json({
    status: "success",
    message: "Shareable link deleted successfully",
  });
});

// GET /api/shareable-links/stats
const getShareableLinkStats = asyncHandler(async (req, res) => {
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  const stats = await shareableLinkService.getShareableLinkStats({
    userId,
    workspaceId,
  });

  res.status(200).json({
    status: "success",
    message: "Shareable link statistics retrieved successfully",
    data: { stats },
  });
});

// GET /api/share/:token (Public endpoint - no authentication required)
const getConversationByToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) throw new ApiError(400, "Token is required");

  const shareableLink = await shareableLinkService.getConversationByToken({
    token,
  });

  res.status(200).json({
    status: "success",
    message: "Conversation retrieved successfully",
    data: { shareableLink },
  });
});

module.exports = {
  createShareableLink,
  getUserShareableLinks,
  getShareableLinkById,
  deleteShareableLink,
  getShareableLinkStats,
  getConversationByToken,
};
