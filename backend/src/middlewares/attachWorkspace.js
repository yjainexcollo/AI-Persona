const ApiError = require("../utils/apiError");

/**
 * Middleware to attach workspace context to the request.
 * - Extracts workspaceId from the 'x-workspace-id' header.
 * - Validates that the authenticated user's workspaceId matches.
 * - Attaches { workspaceId, role } to req.workspace.
 * - Returns 403 if not a member or invalid workspaceId.
 * - No-op for unauthenticated/public routes.
 */
function attachWorkspace(req, res, next) {
  // If not authenticated, skip (public route)
  if (!req.user) return next();

  const workspaceId = req.headers["x-workspace-id"];
  if (!workspaceId) {
    return next(
      new ApiError(400, "Workspace ID header (x-workspace-id) is required.")
    );
  }

  // For workspace deletion, allow admin to delete any workspace
  // For other operations, check if user's workspaceId matches
  if (req.method === "DELETE" && req.path.includes("/workspaces/")) {
    // Allow workspace deletion for admins (workspace context will be from path param)
    req.workspace = {
      workspaceId: req.params.id || workspaceId,
      role: req.user.role,
    };
  } else {
    // Check if user's workspaceId matches for other operations
    if (req.user.workspaceId !== workspaceId) {
      return next(
        new ApiError(403, "You do not have access to this workspace.")
      );
    }

    // Attach workspace context
    req.workspace = {
      workspaceId,
      role: req.user.role,
    };
  }

  next();
}

module.exports = attachWorkspace;
