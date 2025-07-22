const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ApiError = require("../utils/apiError");
const { hashPassword, verifyPassword } = require("../utils/password");
const logger = require("../utils/logger");

// Helper: Ensure user is a member of the workspace
async function assertMembership(userId, workspaceId) {
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!membership || !membership.isActive) {
    throw new ApiError(403, "User is not a member of this workspace");
  }
  return membership;
}

// Get current user's profile (scoped to workspace)
async function getProfile(userId, workspaceId) {
  await assertMembership(userId, workspaceId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        where: { workspaceId },
      },
    },
  });
  if (!user) throw new ApiError(404, "User not found");
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    memberships: user.memberships,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// Update profile (name, optionally email) - scoped to workspace
async function updateProfile(userId, workspaceId, { name, email }) {
  await assertMembership(userId, workspaceId);
  const data = {};
  if (name) data.name = name;
  if (email) data.email = email; // Optionally, trigger email verification flow here
  if (Object.keys(data).length === 0)
    throw new ApiError(400, "No profile fields to update");
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  logger.info(`User ${userId} updated profile in workspace ${workspaceId}`);
  return user;
}

// Change password - scoped to workspace
async function changePassword(
  userId,
  workspaceId,
  currentPassword,
  newPassword
) {
  await assertMembership(userId, workspaceId);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash)
    throw new ApiError(404, "User not found or password not set");
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
  await assertMembership(userId, workspaceId);
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });
  logger.info(
    `User ${userId} deactivated their account in workspace ${workspaceId}`
  );
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
};
