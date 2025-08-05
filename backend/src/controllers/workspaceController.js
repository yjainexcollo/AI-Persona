const workspaceService = require("../services/workspaceService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

// GET /api/workspaces/:id
const getWorkspace = asyncHandler(async (req, res) => {
  const workspaceId = req.params.id;
  const userId = req.user.id;

  const workspace = await workspaceService.getWorkspace(workspaceId, userId);

  res.status(200).json({
    status: "success",
    data: { workspace },
  });
});

// PUT /api/workspaces/:id
const updateWorkspace = asyncHandler(async (req, res) => {
  const workspaceId = req.params.id;
  const userId = req.user.id;
  const { name, timezone, locale } = req.body;

  const updatedWorkspace = await workspaceService.updateWorkspace(
    workspaceId,
    userId,
    { name, timezone, locale }
  );

  res.status(200).json({
    status: "success",
    message: "Workspace updated successfully",
    data: { workspace: updatedWorkspace },
  });
});

// GET /api/workspaces/:id/members (Smart listing with query params)
const listMembers = asyncHandler(async (req, res) => {
  const workspaceId = req.params.id;
  const userId = req.user.id;
  const { search, status, role, page = 1, limit = 20 } = req.query;

  const result = await workspaceService.listMembers(workspaceId, userId, {
    search,
    status,
    role,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.status(200).json({
    status: "success",
    data: result.members,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: result.total,
    },
  });
});

// PATCH /api/workspaces/:id/members/:uid/role
const changeRole = asyncHandler(async (req, res) => {
  const workspaceId = req.params.id;
  const memberId = req.params.uid;
  const userId = req.user.id;
  const { role } = req.body;

  const updatedMember = await workspaceService.changeMemberRole(
    workspaceId,
    userId,
    memberId,
    role
  );

  res.status(200).json({
    status: "success",
    message: "Member role updated successfully",
    data: { member: updatedMember },
  });
});

// PATCH /api/workspaces/:id/members/:uid/status
const changeStatus = asyncHandler(async (req, res) => {
  const workspaceId = req.params.id;
  const memberId = req.params.uid;
  const userId = req.user.id;
  const { status } = req.body;

  const updatedMember = await workspaceService.changeMemberStatus(
    workspaceId,
    userId,
    memberId,
    status
  );

  res.status(200).json({
    status: "success",
    message: "Member status updated successfully",
    data: { member: updatedMember },
  });
});

// DELETE /api/workspaces/:id/members/:uid
const removeMember = asyncHandler(async (req, res) => {
  const workspaceId = req.params.id;
  const memberId = req.params.uid;
  const userId = req.user.id;

  await workspaceService.removeMember(workspaceId, userId, memberId);

  res.status(200).json({
    status: "success",
    message: "Member removed successfully",
  });
});

// POST /api/workspaces/:id/delete
const requestDeletion = asyncHandler(async (req, res) => {
  const workspaceId = req.params.id;
  const userId = req.user.id;
  const { reason } = req.body;

  await workspaceService.requestDeletion(workspaceId, userId, reason);

  res.status(200).json({
    status: "success",
    message: "Workspace deletion requested successfully",
  });
});

module.exports = {
  getWorkspace,
  updateWorkspace,
  listMembers,
  changeRole,
  changeStatus,
  removeMember,
  requestDeletion,
};
