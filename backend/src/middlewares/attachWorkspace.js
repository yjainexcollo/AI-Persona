const apiError = require("../utils/apiError");

/**
 * Middleware to attach workspace context to the request.
 * - Extracts workspaceId from the 'x-workspace-id' header.
 * - Validates that the authenticated user is a member of the workspace.
 * - Attaches { workspaceId, role } to req.workspace.
 * - Returns 403 if not a member or invalid workspaceId.
 * - No-op for unauthenticated/public routes.
 */
function attachWorkspace(req, res, next) {
  // If not authenticated, skip (public route)
  if (!req.user) return next();

  const workspaceId = req.headers["x-workspace-id"];
  if (!workspaceId) {
    return res
      .status(400)
      .json(apiError("Workspace ID header (x-workspace-id) is required."));
  }

  // Check if user is a member of the workspace
  const membership = Array.isArray(req.user.memberships)
    ? req.user.memberships.find((m) => m.workspaceId === workspaceId)
    : null;

  if (!membership) {
    return res
      .status(403)
      .json(apiError("You do not have access to this workspace."));
  }

  // Attach workspace context
  req.workspace = {
    workspaceId,
    role: membership.role,
  };

  next();
}

module.exports = attachWorkspace;
