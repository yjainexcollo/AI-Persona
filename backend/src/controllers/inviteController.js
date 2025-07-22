const inviteService = require("../services/inviteService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const sendInvite = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const workspaceId = req.workspace && req.workspace.workspaceId;
  const senderRole = req.workspace && req.workspace.role;
  const createdById = req.user && req.user.id;
  if (!createdById) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  if (senderRole !== "ADMIN")
    throw new ApiError(403, "Admin role required to send invites");
  if (!email) throw new ApiError(400, "Email is required");
  const invite = await inviteService.sendInvite({
    email,
    workspaceId,
    role,
    createdById,
  });
  res
    .status(200)
    .json({ status: "success", message: "Invite sent", data: { invite } });
});

const acceptInvite = asyncHandler(async (req, res) => {
  const { token, userId } = req.body;
  // userId can be from req.user (if logged in) or from body (if signup flow)
  const resolvedUserId = userId || (req.user && req.user.id);
  if (!token || !resolvedUserId)
    throw new ApiError(400, "Token and userId are required");
  const invite = await inviteService.acceptInvite(token, resolvedUserId);
  res
    .status(200)
    .json({ status: "success", message: "Invite accepted", data: { invite } });
});

module.exports = {
  sendInvite,
  acceptInvite,
};
