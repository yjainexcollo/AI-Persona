const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const attachWorkspace = require("../middlewares/attachWorkspace");

// Get current user's profile
router.get("/me", authMiddleware, attachWorkspace, userController.getProfile);

// Update profile (name/email)
router.put("/me", authMiddleware, attachWorkspace, userController.updateProfile);

// Change password
router.put("/me/password", authMiddleware, attachWorkspace, userController.changePassword);

// Deactivate account
router.post("/me/deactivate", authMiddleware, attachWorkspace, userController.deactivateAccount);

module.exports = router;
