const ApiError = require("../utils/apiError");

/**
 * Middleware for workspace-specific operations.
 * - For DELETE operations on workspaces, doesn't require x-workspace-id header
 * - For other operations, requires x-workspace-id header and validates access
 */
function workspaceMiddleware(req, res, next) {
  // If not authenticated, skip (public route)
  if (!req.user) return next();

  // For workspace deletion, use the workspace ID from the path
  if (req.method === "DELETE" && req.path.includes("/workspaces/")) {
    const workspaceId = req.params.id;
    if (!workspaceId) {
      return next(new ApiError(400, "Workspace ID is required in path"));
    }

    req.workspace = {
      workspaceId,
      role: req.user.role,
    };
  } else {
    // For other operations, require x-workspace-id header
    const workspaceId = req.headers["x-workspace-id"];
    if (!workspaceId) {
      return next(
        new ApiError(400, "Workspace ID header (x-workspace-id) is required.")
      );
    }

    // Check if user's workspaceId matches
    if (req.user.workspaceId !== workspaceId) {
      return next(
        new ApiError(403, "You do not have access to this workspace.")
      );
    }

    req.workspace = {
      workspaceId,
      role: req.user.role,
    };
  }

  next();
}

module.exports = workspaceMiddleware;
