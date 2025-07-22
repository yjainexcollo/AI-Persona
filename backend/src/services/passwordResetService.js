const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateToken } = require("../utils/token");
const emailService = require("./emailService");
const { hashPassword } = require("../utils/password");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

// Request a password reset: generate token, store, and send email
async function requestPasswordReset(email, workspaceId) {
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        where: { workspaceId },
      },
    },
  });
  if (!user || !user.memberships || user.memberships.length === 0) {
    logger.warn(
      `Password reset requested for non-existent or non-member email: ${email} in workspace ${workspaceId}`
    );
    // For security, do not reveal if user exists
    return;
  }
  // Invalidate old tokens
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  // Generate new token
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });
  logger.info(
    `Password reset token created for user ${user.id} in workspace ${workspaceId}`
  );
  // Send email
  await emailService.sendPasswordResetEmail(user, token);
}

// Validate a password reset token
async function validateResetToken(token) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });
  if (!record || record.expiresAt < new Date() || record.used) {
    logger.warn(`Invalid or expired password reset token: ${token}`);
    throw new ApiError(400, "Invalid or expired password reset token");
  }
  return record;
}

// Reset the user's password
async function resetPassword(token, newPassword, workspaceId) {
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  const record = await validateResetToken(token);
  const user = await prisma.user.findUnique({
    where: { id: record.userId },
    include: {
      memberships: {
        where: { workspaceId },
      },
    },
  });
  if (!user || !user.memberships || user.memberships.length === 0) {
    throw new ApiError(403, "User is not a member of this workspace");
  }
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  await prisma.passwordResetToken.update({
    where: { token },
    data: { used: true, usedAt: new Date() },
  });
  logger.info(`Password reset for user ${user.id} in workspace ${workspaceId}`);
}

module.exports = {
  requestPasswordReset,
  validateResetToken,
  resetPassword,
};
