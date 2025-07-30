const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const workspaceController = require("../controllers/workspaceController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const workspaceMiddleware = require("../middlewares/workspaceMiddleware");

// All routes require ADMIN role
const adminOnly = [
  authMiddleware,
  workspaceMiddleware,
  roleMiddleware(["ADMIN"]),
];

// Routes that require authentication but not necessarily admin role
const authenticated = [authMiddleware, workspaceMiddleware];

// Get workspace details
router.get("/:id", ...authenticated, workspaceController.getWorkspaceById);

// Get workspace statistics
router.get(
  "/:id/stats",
  ...authenticated,
  workspaceController.getWorkspaceStats
);

// Workspace deletion endpoint
router.delete("/:id", ...adminOnly, adminController.deleteWorkspace);

module.exports = router;
