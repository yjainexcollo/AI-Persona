const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const attachWorkspace = require("../middlewares/attachWorkspace");

// All routes require ADMIN role
const adminOnly = [authMiddleware, attachWorkspace, roleMiddleware(["ADMIN"])];

// Workspace deletion endpoint
router.delete("/:id", ...adminOnly, adminController.deleteWorkspace);

module.exports = router;
