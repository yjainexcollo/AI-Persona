const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");
const ApiError = require("../utils/apiError");

const prisma = new PrismaClient();

// List users in workspace (with optional filters/pagination)
async function listUsers({ skip, take, search, workspaceId }) {
  const where = { workspaceId };

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        role: true,
        workspaceId: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}

// Get user details (workspace-scoped)
async function getUser(userId, workspaceId) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      workspaceId: workspaceId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      role: true,
      workspaceId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new ApiError(404, "User not found in workspace");
  return user;
}

// Activate user (workspace-scoped)
async function activateUser(userId, workspaceId) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      workspaceId: workspaceId,
    },
  });

  if (!user) throw new ApiError(404, "User not found in workspace");

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
    select: {
      id: true,
      isActive: true,
      role: true,
      workspaceId: true,
    },
  });

  logger.info(`Admin activated user ${userId} in workspace ${workspaceId}`);
  return updatedUser;
}

// Deactivate user (workspace-scoped)
async function deactivateUser(userId, workspaceId) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      workspaceId: workspaceId,
    },
  });

  if (!user) throw new ApiError(404, "User not found in workspace");

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    select: {
      id: true,
      isActive: true,
      role: true,
      workspaceId: true,
    },
  });

  logger.info(`Admin deactivated user ${userId} in workspace ${workspaceId}`);
  return updatedUser;
}

// Get workspace stats
async function getStats(workspaceId) {
  const [userCount, activeUserCount, membersCount] = await Promise.all([
    prisma.user.count({ where: { workspaceId } }),
    prisma.user.count({ where: { workspaceId, isActive: true } }),
    prisma.user.count({ where: { workspaceId, role: "MEMBER" } }),
  ]);

  return {
    users: userCount,
    activeUsers: activeUserCount,
    members: membersCount,
  };
}

module.exports = {
  listUsers,
  getUser,
  activateUser,
  deactivateUser,
  getStats,
};
