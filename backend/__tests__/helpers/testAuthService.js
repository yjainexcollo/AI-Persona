const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ApiError = require("../../src/utils/apiError");

// Mock external services for tests
const breachCheckService = {
  validatePasswordWithBreachCheck: jest.fn().mockResolvedValue({
    isValid: true,
    reason: "Password is secure",
    severity: "safe",
  }),
};

const emailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
};

// Test-specific AuthService that uses the test Prisma client
async function register({ email, password, name }) {
  // Validate password strength (mock)
  const breachCheckResult =
    await breachCheckService.validatePasswordWithBreachCheck(password);
  if (!breachCheckResult.isValid) {
    throw new ApiError(400, breachCheckResult.reason);
  }

  // Check if user already exists
  const existingUser = await global.testPrisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    // Reactivate existing user
    const updatedUser = await global.testPrisma.user.update({
      where: { email },
      data: {
        passwordHash: await bcrypt.hash(password, 10),
        name,
        status: "PENDING_VERIFY",
        emailVerified: false,
        failedLoginCount: 0,
        lockedUntil: null,
      },
      include: { workspace: true },
    });

    // Send verification email (mock)
    await emailService.sendVerificationEmail(updatedUser.email, "mock-token");

    return {
      user: updatedUser,
      workspace: updatedUser.workspace,
      isNewUser: false,
    };
  }

  // Create new workspace with unique domain
  const timestamp = Date.now();
  const workspace = await global.testPrisma.workspace.create({
    data: {
      name: `${name}'s Workspace`,
      domain: `test-${timestamp}.com`,
    },
  });

  // Create new user with the workspace ID
  const user = await global.testPrisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      name,
      status: "PENDING_VERIFY",
      emailVerified: false,
      role: "ADMIN",
      workspaceId: workspace.id,
    },
    include: { workspace: true },
  });

  // Send verification email (mock)
  await emailService.sendVerificationEmail(user.email, "mock-token");

  return {
    user,
    workspace,
    isNewUser: true,
  };
}

async function login({ email, password }) {
  const user = await global.testPrisma.user.findUnique({
    where: { email },
    include: { workspace: true },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check account status
  if (user.status === "PENDING_VERIFY") {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  if (user.status === "DEACTIVATED") {
    throw new ApiError(403, "Account is deactivated");
  }

  if (user.status === "PENDING_DELETION") {
    throw new ApiError(403, "Account is pending deletion");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate tokens
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || "test-secret-key-for-jwt-signing",
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || "test-secret-key-for-jwt-signing",
    { expiresIn: "7d" }
  );

  // Update user login info
  await global.testPrisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
}

module.exports = {
  register,
  login,
  breachCheckService,
  emailService,
};
