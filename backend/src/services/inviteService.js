const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateToken } = require("../utils/token");
const emailService = require("./emailService");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

// Send an invite to a user for a workspace
async function sendInvite({
  email,
  workspaceId,
  role = "MEMBER",
  createdById,
}) {
  if (!workspaceId) throw new ApiError(400, "Workspace context required");
  // Get the inviter's workspace
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });
  if (!workspace) throw new ApiError(404, "Workspace not found");
  // Check if invited email's domain matches the workspace domain
  const invitedDomain = email.split("@")[1]?.toLowerCase();
  if (invitedDomain !== workspace.domain.toLowerCase()) {
    throw new ApiError(
      400,
      "You can only invite users with the same email domain as your workspace."
    );
  }
  // Check if user is already a member of this workspace
  const existingUser = await prisma.user.findFirst({
    where: { email, workspaceId },
  });
  if (existingUser) {
    throw new ApiError(409, "User is already a member of this workspace");
  }
  // Invalidate old invites for this email/workspace
  await prisma.invite.deleteMany({
    where: { email, workspaceId, used: false },
  });
  // Generate new invite token
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours expiry
  const invite = await prisma.invite.create({
    data: {
      email,
      token,
      expiresAt,
      workspaceId,
      createdById,
    },
  });
  logger.info(`Invite created for ${email} to workspace ${workspaceId}`);
  // Send invite email
  await emailService.sendInviteEmail(email, token, workspaceId);
  return invite;
}

// Validate an invite token
async function validateInviteToken(token) {
  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite || invite.used || invite.expiresAt < new Date()) {
    logger.warn(`Invalid or expired invite token: ${token}`);
    throw new ApiError(400, "Invalid or expired invite token");
  }
  return invite;
}

// Accept an invite (assign user to workspace)
async function acceptInvite(token, userId) {
  const invite = await validateInviteToken(token);
  // Check if a user with the invited email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email },
  });
  if (existingUser) {
    // If the user exists, deny joining the inviter's workspace
    throw new ApiError(
      409,
      "This email is already registered. You cannot join another company’s workspace with this email."
    );
  }
  // If user does not exist, proceed (user should have just registered)
  // After registration, assign to a new workspace based on domain (handled in registration logic)
  // Mark invite as used (so it can't be reused)
  await prisma.invite.update({
    where: { token },
    data: { used: true },
  });
  logger.info(`Invite for ${invite.email} marked as used after registration.`);
  return invite;
}

module.exports = {
  sendInvite,
  validateInviteToken,
  acceptInvite,
};
