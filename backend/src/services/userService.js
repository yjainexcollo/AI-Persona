const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");
const ApiError = require("../utils/apiError");

const prisma = new PrismaClient();

// Get current user's profile
async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      status: true,
      role: true,
      workspaceId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new ApiError(404, "User not found");
  return user;
}

// Get workspace users (users in the same workspace)
async function getWorkspaceUsers(workspaceId) {
  const users = await prisma.user.findMany({
    where: {
      workspaceId: workspaceId,
      status: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      status: true,
      role: true,
      workspaceId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  logger.info(`Retrieved ${users.length} users for workspace ${workspaceId}`);
  return users;
}

// Update profile (name, optionally email)
async function updateProfile(userId, { name, email }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new ApiError(404, "User not found");

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      status: true,
      role: true,
      workspaceId: true,
    },
  });

  logger.info(`User ${userId} updated profile`);
  return updatedUser;
}

// Change password
async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new ApiError(404, "User not found");

  // Verify current password
  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword },
  });

  logger.info(`User ${userId} changed password`);
}

// Deactivate (soft delete) account
async function deactivateAccount(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new ApiError(404, "User not found");

  await prisma.user.update({
    where: { id: userId },
    data: { status: "DEACTIVATED" },
  });

  logger.info(`User ${userId} deactivated their account`);
}

// Get workspace stats (available to all users in the workspace)
async function getWorkspaceStats(workspaceId) {
  const [userCount, activeUserCount, membersCount] = await Promise.all([
    prisma.user.count({ where: { workspaceId } }),
    prisma.user.count({ where: { workspaceId, status: "ACTIVE" } }),
    prisma.user.count({ where: { workspaceId, role: "MEMBER" } }),
  ]);

  return {
    users: userCount,
    activeUsers: activeUserCount,
    members: membersCount,
  };
}

module.exports = {
  getProfile,
  getWorkspaceUsers,
  updateProfile,
  changePassword,
  deactivateAccount,
  getWorkspaceStats,
};
