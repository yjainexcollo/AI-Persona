const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const workspaceMiddleware = require("../middlewares/workspaceMiddleware");

// All routes require ADMIN role
const adminOnly = [
  authMiddleware,
  workspaceMiddleware,
  roleMiddleware(["ADMIN"]),
];

// Workspace deletion endpoint
router.delete("/:id", ...adminOnly, adminController.deleteWorkspace);

module.exports = router;
