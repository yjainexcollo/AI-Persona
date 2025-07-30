const ApiError = require("../utils/apiError");

/**
 * Middleware for user-specific operations.
 * - Allows users to access their own profile data without requiring x-workspace-id header
 * - Attaches user context to the request
 */
function userMiddleware(req, res, next) {
  // If not authenticated, skip (public route)
  if (!req.user) return next();

  // For user profile operations, don't require x-workspace-id header
  // Users should be able to access their own data
  req.userContext = {
    userId: req.user.id,
    workspaceId: req.user.workspaceId,
    role: req.user.role,
  };

  next();
}

module.exports = userMiddleware;
