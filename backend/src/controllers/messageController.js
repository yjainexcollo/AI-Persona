/**
 * MessageController - Message editing functionality
 * Handles message editing and conversation branching
 */

const personaService = require("../services/personaService");
const apiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");

/**
 * Edit a user message and branch the conversation
 * PATCH /api/messages/:id
 */
const editMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  const result = await personaService.editMessage(id, userId, content);

  res.status(200).json(
    apiResponse({
      data: result,
      message: "Message edited successfully",
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

module.exports = {
  editMessage,
  toggleReaction,
};
