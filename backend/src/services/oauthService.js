const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");
const ApiError = require("../utils/apiError");
const { signToken, signRefreshToken } = require("../utils/jwt");

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

// Handle OAuth login/registration
async function handleOAuthLogin(provider, profile) {
  const { id, emails, displayName } = profile;

  if (!emails || emails.length === 0) {
    throw new ApiError(400, "Email is required for OAuth login");
  }

  const email = emails[0].value;
  const name = displayName || email.split("@")[0];

  // Find existing user
  let user = await prisma.user.findUnique({
    where: { email },
    include: {
      workspace: true,
    },
  });

  if (user) {
    // Existing user - log them in
    if (user.status !== "ACTIVE") {
      throw new ApiError(403, "Account is deactivated");
    }

    logger.info(
      `OAuth user login: ${user.id} (${user.email}) in workspace ${user.workspaceId} via ${provider}`
    );

    // Generate tokens
    const accessToken = await signToken({
      userId: user.id,
      workspaceId: user.workspaceId,
      role: user.role,
    });
    const refreshToken = await signRefreshToken({
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

    return {
      status: "success",
      message: "OAuth login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          status: user.status,
          role: user.role,
          workspaceId: user.workspaceId,
        },
        workspaceId: user.workspaceId,
        workspaceName: user.workspace?.name || "Unknown Workspace",
        accessToken,
        refreshToken,
        isNewUser: false,
        provider,
      },
    };
  } else {
    // New user - create account
    const workspace = await getOrCreateDefaultWorkspace(email);

    // Check if this is the first user in the workspace
    const userCount = await prisma.user.count({
      where: { workspaceId: workspace.id },
    });
    const role = userCount === 0 ? "ADMIN" : "MEMBER";

    const user = await prisma.user.create({
      data: {
        email,
        name,
        emailVerified: true, // OAuth users are pre-verified
        status: "ACTIVE",
        workspaceId: workspace.id,
        role,
      },
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

    logger.info(
      `OAuth user created: ${user.id} (${user.email}) in workspace ${workspace.id} as ${role} via ${provider}`
    );

    // Generate tokens
    const accessToken = await signToken({
      userId: user.id,
      workspaceId: user.workspaceId,
      role: user.role,
    });
    const refreshToken = await signRefreshToken({
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

    return {
      status: "success",
      message: "OAuth registration successful",
      data: {
        user,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        accessToken,
        refreshToken,
        isNewUser: true,
        provider,
      },
    };
  }
}

module.exports = {
  handleOAuthLogin,
};
