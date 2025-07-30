const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");
const ApiError = require("../utils/apiError");

const prisma = new PrismaClient();

// List all users (with optional filters/pagination)
async function listUsers({ skip, take, search }) {
  const where = {};

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

// Get user details
async function getUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new ApiError(404, "User not found");
  return user;
}

// Activate user
async function activateUser(userId) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!user) throw new ApiError(404, "User not found");
  logger.info(`Admin activated user ${userId}`);
  return user;
}

// Deactivate user
async function deactivateUser(userId) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!user) throw new ApiError(404, "User not found");
  logger.info(`Admin deactivated user ${userId}`);
  return user;
}

// Get system stats
async function getStats() {
  const [userCount, activeUserCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
  ]);

  return {
    users: userCount,
    activeUsers: activeUserCount,
  };
}

module.exports = {
  listUsers,
  getUser,
  activateUser,
  deactivateUser,
  getStats,
};
