const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");
const ApiError = require("../utils/apiError");
const { signToken, signRefreshToken } = require("../utils/jwt");

const prisma = new PrismaClient();

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
  });

  if (user) {
    // Existing user - log them in
    if (!user.isActive) {
      throw new ApiError(403, "Account is deactivated");
    }

    logger.info(`OAuth user login: ${user.id} (${user.email}) via ${provider}`);

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

    return {
      status: "success",
      message: "OAuth login successful",
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
        isNewUser: false,
        provider,
      },
    };
  } else {
    // New user - create account
    const user = await prisma.user.create({
      data: {
        email,
        name,
        emailVerified: true, // OAuth users are pre-verified
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        isActive: true,
      },
    });

    logger.info(
      `OAuth user created: ${user.id} (${user.email}) via ${provider}`
    );

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

    return {
      status: "success",
      message: "OAuth registration successful",
      data: {
        user,
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
