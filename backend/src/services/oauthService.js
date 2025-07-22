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
    include: { memberships: true },
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
    user = await prisma.user.create({
      data: {
        email,
        name,
        emailVerified: true,
        isActive: true,
        memberships: {
          create: {
            workspaceId: workspace.id,
            role: "MEMBER",
            isActive: true,
          },
        },
      },
      include: { memberships: true },
    });
    isNewUser = true;
    logger.info(
      `OAuth user created: ${user.id} (${user.email}) in workspace ${workspace.id} via ${provider}`
    );
  } else {
    // Always use the first (and only) membership
    workspace = await prisma.workspace.findUnique({
      where: { id: user.memberships[0].workspaceId },
    });
    logger.info(
      `OAuth user login: ${user.id} (${user.email}) in workspace ${workspace.id} via ${provider}`
    );
  }

  // Defensive check for single membership
  const membership = user.memberships[0];
  if (!membership)
    throw new ApiError(403, "User is not a member of any workspace");

  // Generate tokens
  const accessToken = signToken({
    userId: user.id,
    workspaceId: membership.workspaceId,
    role: membership.role,
  });
  const refreshToken = signRefreshToken({
    userId: user.id,
    workspaceId: membership.workspaceId,
    role: membership.role,
  });

  return apiResponse({
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        memberships: user.memberships, // will always be one
      },
      workspaceId: membership.workspaceId,
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
