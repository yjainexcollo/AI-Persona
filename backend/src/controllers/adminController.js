const adminService = require("../services/adminService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

// GET /api/admin/users
const listUsers = asyncHandler(async (req, res) => {
  const { skip, take, search } = req.query;
  const workspaceId = req.user && req.user.workspaceId;
  const role = req.user && req.user.role;
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  if (role !== "ADMIN") throw new ApiError(403, "Admin role required");
  const result = await adminService.listUsers({
    workspaceId,
    skip: skip ? parseInt(skip) : 0,
    take: take ? parseInt(take) : 20,
    search: search || "",
  });
  res.status(200).json({ status: "success", ...result });
});

// GET /api/admin/users/:id
const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const workspaceId = req.user && req.user.workspaceId;
  const role = req.user && req.user.role;
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  if (role !== "ADMIN") throw new ApiError(403, "Admin role required");
  const user = await adminService.getUser(id, workspaceId);
  res.status(200).json({ status: "success", user });
});

// POST /api/admin/users/:id/activate
const activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const workspaceId = req.user && req.user.workspaceId;
  const role = req.user && req.user.role;
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  if (role !== "ADMIN") throw new ApiError(403, "Admin role required");
  const user = await adminService.activateUser(id, workspaceId);
  res.status(200).json({ status: "success", message: "User activated", user });
});

// POST /api/admin/users/:id/deactivate
const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const workspaceId = req.user && req.user.workspaceId;
  const role = req.user && req.user.role;
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  if (role !== "ADMIN") throw new ApiError(403, "Admin role required");
  const user = await adminService.deactivateUser(id, workspaceId);
  res
    .status(200)
    .json({ status: "success", message: "User deactivated", user });
});

// GET /api/admin/workspace (current workspace only)
const getCurrentWorkspace = asyncHandler(async (req, res) => {
  const workspaceId = req.user && req.user.workspaceId;
  const role = req.user && req.user.role;
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  if (role !== "ADMIN") throw new ApiError(403, "Admin role required");
  const workspace = await adminService.getWorkspace(workspaceId);
  res.status(200).json({ status: "success", workspace });
});

// GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const role = req.user && req.user.role;
  if (role !== "ADMIN") throw new ApiError(403, "Admin role required");
  const stats = await adminService.getStats();
  res.status(200).json({ status: "success", stats });
});

// DELETE /api/admin/workspace/:id
const deleteWorkspace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = req.user && req.user.role;
  if (role !== "ADMIN") throw new ApiError(403, "Admin role required");
  await adminService.deleteWorkspace(id);
  res.status(200).json({ status: "success", message: "Workspace deleted" });
});

module.exports = {
  listUsers,
  getUser,
  activateUser,
  deactivateUser,
  getCurrentWorkspace,
  getStats,
  deleteWorkspace, // add this export
};
