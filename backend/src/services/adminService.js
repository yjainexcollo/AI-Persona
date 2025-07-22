const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

// List all users in a workspace (with optional filters/pagination)
async function listUsers({
  workspaceId,
  skip = 0,
  take = 20,
  search = "",
} = {}) {
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  const where = {
    memberships: {
      some: { workspaceId },
    },
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
    include: { memberships: true },
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
      memberships: { some: { workspaceId } },
    },
    include: { memberships: true },
  });
  if (!user) throw new ApiError(404, "User not found in this workspace");
  return user;
}

// Activate user in a workspace
async function activateUser(userId, workspaceId) {
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  // Ensure user is a member of the workspace
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!membership)
    throw new ApiError(404, "User is not a member of this workspace");
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
  });
  logger.info(`Admin activated user ${userId} in workspace ${workspaceId}`);
  return user;
}

// Deactivate user in a workspace
async function deactivateUser(userId, workspaceId) {
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  // Ensure user is a member of the workspace
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!membership)
    throw new ApiError(404, "User is not a member of this workspace");
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });
  logger.info(`Admin deactivated user ${userId} in workspace ${workspaceId}`);
  return user;
}

// Get current workspace details
async function getWorkspace(workspaceId) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { memberships: true },
  });
  if (!workspace) throw new ApiError(404, "Workspace not found");
  return workspace;
}

// Get system stats (system-wide)
async function getStats() {
  const [userCount, workspaceCount, inviteCount] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.invite.count(),
  ]);
  return {
    users: userCount,
    workspaces: workspaceCount,
    invites: inviteCount,
  };
}

module.exports = {
  listUsers,
  getUser,
  activateUser,
  deactivateUser,
  getWorkspace,
  getStats,
};
