/**
 * ChatSessionController - Simplified chat session operations
 * Provides only the three required endpoints
 */

const chatSessionService = require("../services/chatSessionService");
const apiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");

/**
 * Get user's chat sessions
 * GET /api/chat-sessions
 */
const getUserChatSessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, limit = 50, offset = 0 } = req.query;

  const options = {
    status: status || undefined,
    limit: parseInt(limit),
    offset: parseInt(offset),
  };

  const chatSessions = await chatSessionService.getUserChatSessions(
    userId,
    options
  );

  res.status(200).json(
    apiResponse({
      data: chatSessions,
      message: "User chat sessions retrieved successfully",
    })
  );
});

/**
 * Get chat session by session ID
 * GET /api/chat-sessions/:sessionId
 */
const getChatSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  const chatSession = await chatSessionService.getChatSession(sessionId);

  // Ensure user can only access their own sessions
  if (chatSession.userId !== userId) {
    return res.status(403).json(
      apiResponse({
        error: "Access denied",
        message: "You can only access your own chat sessions",
      })
    );
  }

  res.status(200).json(
    apiResponse({
      data: chatSession,
      message: "Chat session retrieved successfully",
    })
  );
});

/**
 * Delete a chat session
 * DELETE /api/chat-sessions/:sessionId
 */
const deleteChatSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  const result = await chatSessionService.deleteChatSession(sessionId, userId);

  res.status(200).json(
    apiResponse({
      data: result,
      message: "Chat session deleted successfully",
    })
  );
});

module.exports = {
  getUserChatSessions,
  getChatSession,
  deleteChatSession,
};
