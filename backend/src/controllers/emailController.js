const emailService = require("../services/emailService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) throw new ApiError(400, "Verification token is required");
  const user = await emailService.verifyEmailToken(token);
  res
    .status(200)
    .json({ status: "success", message: "Email verified", data: { user } });
});

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const workspaceId = req.workspace && req.workspace.workspaceId;
  if (!email) throw new ApiError(400, "Email is required");
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  // Only allow resending for users in the current workspace
  const user = await prisma.user.findFirst({
    where: {
      email,
      memberships: { some: { workspaceId } },
    },
  });
  if (!user) throw new ApiError(404, "User not found in this workspace");
  if (user.emailVerified) throw new ApiError(400, "Email already verified");
  await emailService.resendVerificationEmail(user);
  res
    .status(200)
    .json({ status: "success", message: "Verification email resent" });
});

module.exports = {
  verifyEmail,
  resendVerification,
};
