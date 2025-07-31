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

// Promote user to admin (workspace-scoped)
async function promoteToAdmin(userId, workspaceId) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      workspaceId: workspaceId,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found in workspace");
  }

  if (!user.isActive) {
    throw new ApiError(400, "Cannot promote inactive user");
  }

  if (user.role === "ADMIN") {
    throw new ApiError(400, "User is already an admin");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: "ADMIN" },
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

  logger.info(
    `Admin promoted user ${userId} to admin in workspace ${workspaceId}`
  );
  return updatedUser;
}

// Demote admin to member (workspace-scoped)
async function demoteToMember(userId, workspaceId) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      workspaceId: workspaceId,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found in workspace");
  }

  if (!user.isActive) {
    throw new ApiError(400, "Cannot demote inactive user");
  }

  if (user.role === "MEMBER") {
    throw new ApiError(400, "User is already a member");
  }

  // Check if this is the last admin in the workspace
  const adminCount = await prisma.user.count({
    where: {
      workspaceId: workspaceId,
      role: "ADMIN",
      isActive: true,
    },
  });

  if (adminCount <= 1) {
    throw new ApiError(400, "Cannot demote the last admin in the workspace");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: "MEMBER" },
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

  logger.info(
    `Admin demoted user ${userId} to member in workspace ${workspaceId}`
  );
  return updatedUser;
}

module.exports = {
  listUsers,
  getUser,
  activateUser,
  deactivateUser,
  getStats,
  promoteToAdmin,
  demoteToMember,
};
