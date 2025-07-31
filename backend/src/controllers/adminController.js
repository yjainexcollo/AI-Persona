const adminService = require("../services/adminService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

// GET /api/admin/users
const listUsers = asyncHandler(async (req, res) => {
  const { skip, take, search } = req.query;
  const role = req.user && req.user.role;
  const workspaceId = req.user && req.user.workspaceId;

  if (role !== "ADMIN") throw new ApiError(403, "Admin role required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  const result = await adminService.listUsers({
    skip: skip ? parseInt(skip) : 0,
    take: take ? parseInt(take) : 20,
    search: search || "",
    workspaceId,
  });
  res.status(200).json({ status: "success", ...result });
});

// GET /api/admin/users/:id
const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = req.user && req.user.role;
  const workspaceId = req.user && req.user.workspaceId;

  if (role !== "ADMIN") throw new ApiError(403, "Admin role required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  const user = await adminService.getUser(id, workspaceId);
  res.status(200).json({ status: "success", user });
});

// POST /api/admin/users/:id/activate
const activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = req.user && req.user.role;
  const workspaceId = req.user && req.user.workspaceId;

  if (role !== "ADMIN") throw new ApiError(403, "Admin role required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  const user = await adminService.activateUser(id, workspaceId);
  res.status(200).json({ status: "success", message: "User activated", user });
});

// POST /api/admin/users/:id/deactivate
const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = req.user && req.user.role;
  const workspaceId = req.user && req.user.workspaceId;

  if (role !== "ADMIN") throw new ApiError(403, "Admin role required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  const user = await adminService.deactivateUser(id, workspaceId);
  res
    .status(200)
    .json({ status: "success", message: "User deactivated", user });
});

// GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const workspaceId = req.user && req.user.workspaceId;
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  const stats = await adminService.getStats(workspaceId);
  res.status(200).json({ status: "success", data: stats });
});

// POST /api/admin/users/:id/promote
const promoteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = req.user && req.user.role;
  const workspaceId = req.user && req.user.workspaceId;

  if (role !== "ADMIN") throw new ApiError(403, "Admin role required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  const user = await adminService.promoteToAdmin(id, workspaceId);
  res.status(200).json({
    status: "success",
    message: "User promoted to admin",
    user,
  });
});

// POST /api/admin/users/:id/demote
const demoteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = req.user && req.user.role;
  const workspaceId = req.user && req.user.workspaceId;

  if (role !== "ADMIN") throw new ApiError(403, "Admin role required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  const user = await adminService.demoteToMember(id, workspaceId);
  res.status(200).json({
    status: "success",
    message: "User demoted to member",
    user,
  });
});

module.exports = {
  listUsers,
  getUser,
  activateUser,
  deactivateUser,
  getStats,
  promoteUser,
  demoteUser,
};
