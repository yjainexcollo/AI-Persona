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
const emailService = require("./emailService");

const prisma = new PrismaClient();

// Helper function to get or create default workspace
async function getOrCreateDefaultWorkspace(email) {
  const domain = email.split("@")[1] || "default.local";

  let workspace = await prisma.workspace.findUnique({
    where: { domain },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: domain,
        domain,
      },
    });
    logger.info(`Created new workspace: ${workspace.id} (${workspace.domain})`);
  }

  return workspace;
}

// Register a new user
async function register({ email, password, name }) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { workspace: true },
  });

  if (existingUser) {
    // If user exists but is deactivated, reactivate them
    if (!existingUser.isActive) {
      logger.info(`Reactivating deactivated user: ${existingUser.email}`);

      // Update the deactivated user with new password and name
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash: await bcrypt.hash(password, 12),
          name: name || existingUser.name,
          isActive: true,
          emailVerified: false, // Require re-verification
        },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          isActive: true,
          role: true,
          workspaceId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Send verification email
      try {
        const token = await emailService.createEmailVerification(
          updatedUser.id
        );
        await emailService.sendVerificationEmail(updatedUser, token);
        logger.info(`Verification email sent to ${updatedUser.email}`);
      } catch (err) {
        logger.error(
          `Failed to send verification email to ${updatedUser.email}: ${err.message}`
        );
      }

      return {
        status: "success",
        message: "Account reactivated. Verification email sent.",
        data: {
          user: updatedUser,
          workspace: {
            id: updatedUser.workspaceId,
            domain: existingUser.workspace?.domain || "unknown",
          },
        },
      };
    }

    // If user exists and is active, throw error
    throw new ApiError(409, "Email already registered");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Get or create workspace
  const workspace = await getOrCreateDefaultWorkspace(email);

  // Check if this is the first user in the workspace
  const userCount = await prisma.user.count({
    where: { workspaceId: workspace.id },
  });
  const role = userCount === 0 ? "ADMIN" : "MEMBER";

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name,
      workspaceId: workspace.id,
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      isActive: true,
      role: true,
      workspaceId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  logger.info(
    `User registered: ${user.id} (${user.email}) in workspace ${workspace.id} as ${role}`
  );

  // Send verification email
  try {
    const token = await emailService.createEmailVerification(user.id);
    await emailService.sendVerificationEmail(user, token);
    logger.info(`Verification email sent to ${user.email}`);
  } catch (err) {
    logger.error(
      `Failed to send verification email to ${user.email}: ${err.message}`
    );
    // Don't throw error here - user is created successfully, just email failed
  }

  return {
    status: "success",
    message: "Registration successful. Verification email sent.",
    data: {
      user,
      workspace: {
        id: workspace.id,
        domain: workspace.domain,
      },
    },
  };
}

// Login user
async function login({ email, password }) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      workspace: true,
    },
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
  const accessToken = signToken({
    userId: user.id,
    workspaceId: user.workspaceId,
    role: user.role,
  });
  const refreshToken = signRefreshToken({
    userId: user.id,
    workspaceId: user.workspaceId,
    role: user.role,
  });

  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  logger.info(
    `User logged in: ${user.id} (${user.email}) in workspace ${user.workspaceId}`
  );

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
        role: user.role,
        workspaceId: user.workspaceId,
      },
      workspaceId: user.workspaceId,
      workspaceName: user.workspace?.name || "Unknown Workspace",
      accessToken,
      refreshToken,
    },
  };
}

// Refresh tokens
async function refreshTokens({ refreshToken }) {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const { userId, workspaceId, role } = payload;

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
    const newAccessToken = signToken({ userId, workspaceId, role });
    const newRefreshToken = signRefreshToken({ userId, workspaceId, role });

    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        lastUsedAt: new Date(),
      },
    });

    logger.info(
      `Refresh token used for user: ${userId} in workspace ${workspaceId}`
    );

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
