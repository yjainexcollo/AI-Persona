const workspaceService = require("../services/workspaceService");
const logger = require("../utils/logger");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");

class WorkspaceController {
  /**
   * Get workspace details by ID
   * @route GET /api/workspaces/:id
   * @access Private
   */
  getWorkspaceById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const workspace = await workspaceService.getWorkspaceById(id);

    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, workspace, "Workspace retrieved successfully")
      );
  });

  /**
   * Get workspace statistics
   * @route GET /api/workspaces/:id/stats
   * @access Private
   */
  getWorkspaceStats = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await workspaceService.getWorkspaceStats(id);

    if (!result) {
      throw new ApiError(404, "Workspace not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result.stats,
          "Workspace stats retrieved successfully"
        )
      );
  });
}

module.exports = new WorkspaceController();
