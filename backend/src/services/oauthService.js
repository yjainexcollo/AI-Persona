const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { signToken, signRefreshToken } = require("../utils/jwt");
const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

function extractEmail(profile) {
  if (
    profile.emails &&
    Array.isArray(profile.emails) &&
    profile.emails.length > 0
  ) {
    for (const emailObj of profile.emails) {
      if (emailObj && emailObj.value) return emailObj.value;
    }
  }
  if (profile._json && profile._json.email) {
    return profile._json.email;
  }
  return null;
}

async function handleOAuthLogin(provider, profile) {
  const email = extractEmail(profile);
  const name =
    profile.displayName || (profile._json && profile._json.name) || "";
  if (!email) {
    throw new ApiError(400, "OAuth profile missing email");
  }

  // Find or create user (single workspace only)
  let user = await prisma.user.findUnique({
    where: { email },
  });
  let isNewUser = false;
  let workspace;
  if (!user) {
    // Assign to a default workspace by domain, or fallback
    const domain = email.split("@")[1] || "default.local";
    workspace = await prisma.workspace.findUnique({ where: { domain } });
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: domain, domain },
      });
    }
    // Check if this is the first user in the workspace
    const userCount = await prisma.user.count({
      where: { workspaceId: workspace.id },
    });
    const role = userCount === 0 ? "ADMIN" : "MEMBER";
    user = await prisma.user.create({
      data: {
        email,
        name,
        emailVerified: true,
        isActive: true,
        workspaceId: workspace.id,
        role,
      },
    });
    isNewUser = true;
    logger.info(
      `OAuth user created: ${user.id} (${user.email}) in workspace ${workspace.id} as ${role} via ${provider}`
    );
  } else {
    workspace = await prisma.workspace.findUnique({
      where: { id: user.workspaceId },
    });
    logger.info(
      `OAuth user login: ${user.id} (${user.email}) in workspace ${workspace.id} via ${provider}`
    );
  }

  // Defensive check for workspace
  if (!user.workspaceId)
    throw new ApiError(403, "User is not a member of any workspace");

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

  return apiResponse({
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaceId: user.workspaceId,
      },
      workspaceId: user.workspaceId,
      accessToken,
      refreshToken,
      isNewUser,
      provider,
    },
    message: isNewUser
      ? "OAuth registration successful"
      : "OAuth login successful",
  });
}

module.exports = {
  handleOAuthLogin,
};
