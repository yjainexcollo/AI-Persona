const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ApiError = require("../utils/apiError");
const { hashPassword, verifyPassword } = require("../utils/password");
const logger = require("../utils/logger");

// Helper: Delete workspace if it has no users
async function deleteWorkspaceIfEmpty(workspaceId) {
  const userCount = await prisma.user.count({ where: { workspaceId } });
  if (userCount === 0) {
    await prisma.workspace.delete({ where: { id: workspaceId } });
    logger.info(`Workspace ${workspaceId} deleted because it has no users.`);
  }
}

// Get current user's profile (scoped to workspace)
async function getProfile(userId, workspaceId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new ApiError(404, "User not found");
  if (user.workspaceId !== workspaceId)
    throw new ApiError(403, "User is not a member of this workspace");
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    role: user.role,
    workspaceId: user.workspaceId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// Update profile (name, optionally email) - scoped to workspace
async function updateProfile(userId, workspaceId, { name, email }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");
  if (user.workspaceId !== workspaceId)
    throw new ApiError(403, "User is not a member of this workspace");
  const data = {};
  if (name) data.name = name;
  if (email) data.email = email; // Optionally, trigger email verification flow here
  if (Object.keys(data).length === 0)
    throw new ApiError(400, "No profile fields to update");
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });
  logger.info(`User ${userId} updated profile in workspace ${workspaceId}`);
  return updatedUser;
}

// Change password - scoped to workspace
async function changePassword(
  userId,
  workspaceId,
  currentPassword,
  newPassword
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash)
    throw new ApiError(404, "User not found or password not set");
  if (user.workspaceId !== workspaceId)
    throw new ApiError(403, "User is not a member of this workspace");
  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) throw new ApiError(401, "Current password is incorrect");
  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });
  logger.info(`User ${userId} changed password in workspace ${workspaceId}`);
}

// Deactivate (soft delete) account - scoped to workspace
async function deactivateAccount(userId, workspaceId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");
  if (user.workspaceId !== workspaceId)
    throw new ApiError(403, "User is not a member of this workspace");
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });
  logger.info(
    `User ${userId} deactivated their account in workspace ${workspaceId}`
  );
  // Check and delete workspace if empty
  await deleteWorkspaceIfEmpty(workspaceId);
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
};
