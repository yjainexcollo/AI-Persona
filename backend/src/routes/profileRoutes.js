const express = require("express");
const multer = require("multer");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  validateProfileUpdate,
  validatePasswordChange,
  validateAvatarUpload,
} = require("../middlewares/validationMiddleware");

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed"
        ),
        false
      );
    }
  },
});

// Routes
// GET /api/users/me
router.get("/me", authMiddleware, profileController.getMe);

// GET /api/users/profile (alias for backward compatibility)
router.get("/profile", authMiddleware, profileController.getMe);

// PUT /api/users/me
router.put(
  "/me",
  authMiddleware,
  validateProfileUpdate,
  profileController.updateMe
);

// PUT /api/users/profile (alias for backward compatibility)
router.put(
  "/profile",
  authMiddleware,
  validateProfileUpdate,
  profileController.updateMe
);

// POST /api/users/me/avatar
router.post(
  "/me/avatar",
  authMiddleware,
  upload.single("avatar"),
  validateAvatarUpload,
  profileController.uploadAvatar
);

// PUT /api/users/me/password
router.put(
  "/me/password",
  authMiddleware,
  validatePasswordChange,
  profileController.changePassword
);

module.exports = router;
