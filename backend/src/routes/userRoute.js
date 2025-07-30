const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const userMiddleware = require("../middlewares/userMiddleware");

// Get current user's profile
router.get("/me", authMiddleware, userMiddleware, userController.getProfile);

// Update profile (name/email)
router.put("/me", authMiddleware, userMiddleware, userController.updateProfile);

// Change password
router.put(
  "/me/password",
  authMiddleware,
  userMiddleware,
  userController.changePassword
);

// Deactivate account
router.post(
  "/me/deactivate",
  authMiddleware,
  userMiddleware,
  userController.deactivateAccount
);

module.exports = router;
