const userService = require("../services/userService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

// GET /api/users/me
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) throw new ApiError(401, "Authentication required");
  const profile = await userService.getProfile(userId);
  res.status(200).json({ status: "success", data: { user: profile } });
});

// GET /api/users/workspace
const getWorkspaceUsers = asyncHandler(async (req, res) => {
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;
  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  const users = await userService.getWorkspaceUsers(workspaceId);
  res.status(200).json({ status: "success", data: { users } });
});

// PUT /api/users/me
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) throw new ApiError(401, "Authentication required");
  const { name, email } = req.body;
  const user = await userService.updateProfile(userId, {
    name,
    email,
  });
  res
    .status(200)
    .json({ status: "success", message: "Profile updated", data: { user } });
});

// PUT /api/users/me/password
const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) throw new ApiError(401, "Authentication required");
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    throw new ApiError(400, "Current and new password are required");
  await userService.changePassword(userId, currentPassword, newPassword);
  res
    .status(200)
    .json({ status: "success", message: "Password changed successfully" });
});

// POST /api/users/me/deactivate
const deactivateAccount = asyncHandler(async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) throw new ApiError(401, "Authentication required");
  await userService.deactivateAccount(userId);
  res.status(200).json({ status: "success", message: "Account deactivated" });
});

// GET /api/users/stats
const getWorkspaceStats = asyncHandler(async (req, res) => {
  const workspaceId = req.user && req.user.workspaceId;
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  const stats = await userService.getWorkspaceStats(workspaceId);
  res.status(200).json({ status: "success", data: stats });
});

module.exports = {
  getProfile,
  getWorkspaceUsers,
  updateProfile,
  changePassword,
  deactivateAccount,
  getWorkspaceStats,
};
