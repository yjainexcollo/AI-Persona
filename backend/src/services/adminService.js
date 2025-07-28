const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

// Helper: Delete workspace if it has no users
async function deleteWorkspaceIfEmpty(workspaceId) {
  const userCount = await prisma.user.count({ where: { workspaceId } });
  if (userCount === 0) {
    await prisma.workspace.delete({ where: { id: workspaceId } });
    logger.info(`Workspace ${workspaceId} deleted because it has no users.`);
  }
}

// List all users in a workspace (with optional filters/pagination)
async function listUsers({
  workspaceId,
  skip = 0,
  take = 20,
  search = "",
} = {}) {
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  const where = {
    workspaceId,
  };
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }
  const users = await prisma.user.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });
  const total = await prisma.user.count({ where });
  return { users, total };
}

// Get user details in a workspace
async function getUser(userId, workspaceId) {
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      workspaceId,
    },
  });
  if (!user) throw new ApiError(404, "User not found in this workspace");
  return user;
}

// Activate user in a workspace
async function activateUser(userId, workspaceId) {
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  const user = await prisma.user.findFirst({
    where: { id: userId, workspaceId },
  });
  if (!user) throw new ApiError(404, "User is not a member of this workspace");
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
  });
  logger.info(`Admin activated user ${userId} in workspace ${workspaceId}`);
  return updatedUser;
}

// Deactivate user in a workspace
async function deactivateUser(userId, workspaceId) {
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  const user = await prisma.user.findFirst({
    where: { id: userId, workspaceId },
  });
  if (!user) throw new ApiError(404, "User is not a member of this workspace");
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });
  logger.info(`Admin deactivated user ${userId} in workspace ${workspaceId}`);
  // Check and delete workspace if empty
  await deleteWorkspaceIfEmpty(workspaceId);
  return updatedUser;
}

// Get current workspace details
async function getWorkspace(workspaceId) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });
  if (!workspace) throw new ApiError(404, "Workspace not found");
  return workspace;
}

// Delete a workspace by id (admin only)
async function deleteWorkspace(workspaceId) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });
  if (!workspace) throw new ApiError(404, "Workspace not found");
  // Delete all users in the workspace (or handle as needed)
  await prisma.user.deleteMany({ where: { workspaceId } });
  // Delete the workspace
  await prisma.workspace.delete({ where: { id: workspaceId } });
  logger.info(`Workspace ${workspaceId} and all its users deleted by admin.`);
  return { id: workspaceId };
}

// Get system stats (system-wide)
async function getStats() {
  const [userCount, workspaceCount] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
  ]);
  return {
    users: userCount,
    workspaces: workspaceCount,
  };
}

module.exports = {
  listUsers,
  getUser,
  activateUser,
  deactivateUser,
  getWorkspace,
  getStats,
  deleteWorkspace, // add this export
};
