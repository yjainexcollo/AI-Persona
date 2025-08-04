const profileService = require("../services/profileService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

// GET /api/users/me
const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await profileService.getProfile(userId);
  res.status(200).json({
    status: "success",
    data: { user: profile },
  });
});

// PUT /api/users/me
const updateMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, avatarUrl, timezone, locale } = req.body;

  const updatedProfile = await profileService.updateProfile(userId, {
    name,
    avatarUrl,
    timezone,
    locale,
  });

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: { user: updatedProfile },
  });
});

// POST /api/users/me/avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let avatarUrl;
  if (req.file) {
    // Handle multipart/form-data upload
    avatarUrl = await profileService.processAvatarUpload(userId, req.file);
  } else if (req.body.presignedUrl) {
    // Handle presigned URL upload
    avatarUrl = await profileService.processPresignedAvatar(
      userId,
      req.body.presignedUrl
    );
  } else {
    throw new ApiError(400, "No avatar file or presigned URL provided");
  }

  res.status(200).json({
    status: "success",
    message: "Avatar uploaded successfully",
    data: { avatarUrl },
  });
});

// PUT /api/users/me/password
const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  await profileService.changePassword(userId, currentPassword, newPassword);

  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
  });
});

module.exports = {
  getMe,
  updateMe,
  uploadAvatar,
  changePassword,
};
