/**
 * PersonaController - Persona management and chat functionality
 * Handles persona listing, details, favourites, and chat messages
 */

const personaService = require("../services/personaService");
const apiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");

/**
 * Get all personas with optional favourites filter
 * GET /api/personas
 */
const getPersonas = asyncHandler(async (req, res) => {
  const { favouritesOnly } = req.query;
  const userId = req.user.id;

  const options = {
    favouritesOnly: favouritesOnly === "true",
  };

  const personas = await personaService.getPersonas(userId, options);

  res.status(200).json(
    apiResponse({
      data: personas,
      message: "Personas retrieved successfully",
    })
  );
});

/**
 * Get persona by ID
 * GET /api/personas/:id
 */
const getPersonaById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const persona = await personaService.getPersonaById(id, userId);

  res.status(200).json(
    apiResponse({
      data: persona,
      message: "Persona retrieved successfully",
    })
  );
});

/**
 * Toggle persona favourite status
 * POST /api/personas/:id/favourite
 */
const toggleFavourite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await personaService.toggleFavourite(id, userId);

  res.status(200).json(
    apiResponse({
      data: result,
      message: result.isFavourited
        ? "Persona added to favourites"
        : "Persona removed from favourites",
    })
  );
});

/**
 * Send message to persona
 * POST /api/personas/:id/chat
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message, conversationId, fileId } = req.body;
  const userId = req.user.id;

  const result = await personaService.sendMessage(
    id,
    message,
    conversationId,
    userId,
    fileId
  );

  res.status(200).json(
    apiResponse({
      data: result,
      message: "Message sent successfully",
    })
  );
});

/**
 * Get user's conversations
 * GET /api/conversations
 */
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const workspaceId = req.user.workspaceId;
  const { archived } = req.query;

  const options = {
    archived: archived === "true",
  };

  const conversations = await personaService.getConversations(
    userId,
    workspaceId,
    options
  );

  res.status(200).json(
    apiResponse({
      data: conversations,
      message: "Conversations retrieved successfully",
    })
  );
});

/**
 * Update conversation visibility
 * PATCH /api/conversations/:id/visibility
 */
const updateConversationVisibility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { visibility } = req.body;
  const userId = req.user.id;

  const result = await personaService.updateConversationVisibility(
    id,
    userId,
    visibility
  );

  res.status(200).json(
    apiResponse({
      data: result,
      message: "Conversation visibility updated successfully",
    })
  );
});

/**
 * Request file upload URL
 * POST /api/conversations/:id/files
 */
const requestFileUpload = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { filename, mimeType, sizeBytes } = req.body;
  const userId = req.user.id;

  const result = await personaService.requestFileUpload(id, userId, {
    filename,
    mimeType,
    sizeBytes,
  });

  res.status(200).json(
    apiResponse({
      data: result,
      message: "File upload URL generated successfully",
    })
  );
});

/**
 * Toggle message reaction
 * POST /api/messages/:id/reactions
 */
const toggleReaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const userId = req.user.id;

  const result = await personaService.toggleReaction(id, userId, type);

  res.status(200).json(
    apiResponse({
      data: result,
      message: `Reaction ${result.action} successfully`,
    })
  );
});

/**
 * Archive or unarchive conversation
 * PATCH /api/conversations/:id/archive
 */
const toggleArchive = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { archived } = req.body;
  const userId = req.user.id;

  const result = await personaService.toggleArchive(id, userId, archived);

  res.status(200).json(
    apiResponse({
      data: result,
      message: `Conversation ${
        result.archived ? "archived" : "unarchived"
      } successfully`,
    })
  );
});

/**
 * Create or refresh shareable link
 * POST /api/conversations/:id/share
 */
const createShareableLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { expiresInDays } = req.body;
  const userId = req.user.id;

  const result = await personaService.createShareableLink(
    id,
    userId,
    expiresInDays
  );

  res.status(200).json(
    apiResponse({
      data: result,
      message: "Shareable link created successfully",
    })
  );
});

/**
 * Get shared conversation (public endpoint)
 * GET /p/:token
 */
const getSharedConversation = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const result = await personaService.getSharedConversation(token);

  res.status(200).json(
    apiResponse({
      data: result,
      message: "Shared conversation retrieved successfully",
    })
  );
});

module.exports = {
  getPersonas,
  getPersonaById,
  toggleFavourite,
  sendMessage,
  getConversations,
  updateConversationVisibility,
  requestFileUpload,
  toggleReaction,
  toggleArchive,
  createShareableLink,
  getSharedConversation,
};
