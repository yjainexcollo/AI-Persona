const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const ApiError = require("../utils/apiError");
const {
  signToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const prisma = new PrismaClient();

// Register a new user
async function register({ email, password, name }) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  logger.info(`User registered: ${user.id} (${user.email})`);

  return {
    status: "success",
    message: "Registration successful. Verification email sent.",
    data: {
      user,
    },
  };
}

// Login user
async function login({ email, password }) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated");
  }

  // Check if email is verified
  if (!user.emailVerified) {
    throw new ApiError(403, "Email not verified. Please check your inbox.");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate tokens
  const accessToken = signToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  logger.info(`User logged in: ${user.id} (${user.email})`);

  return {
    status: "success",
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
      },
      accessToken,
      refreshToken,
    },
  };
}

// Refresh tokens
async function refreshTokens({ refreshToken }) {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const { userId } = payload;

    // Find session
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || !session.isActive) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (session.expiresAt < new Date()) {
      throw new ApiError(401, "Refresh token expired");
    }

    // Generate new tokens
    const newAccessToken = signToken({ userId });
    const newRefreshToken = signRefreshToken({ userId });

    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        lastUsedAt: new Date(),
      },
    });

    logger.info(`Refresh token used for user: ${userId}`);

    return {
      status: "success",
      message: "Tokens refreshed",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
}

module.exports = {
  register,
  login,
  refreshTokens,
};
