const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const attachWorkspace = require("../middlewares/attachWorkspace");

// All routes require ADMIN role
const adminOnly = [authMiddleware, attachWorkspace, roleMiddleware(["ADMIN"])];

// User management
router.get("/users", ...adminOnly, adminController.listUsers);
router.get("/users/:id", ...adminOnly, adminController.getUser);
router.post("/users/:id/activate", ...adminOnly, adminController.activateUser);
router.post(
  "/users/:id/deactivate",
  ...adminOnly,
  adminController.deactivateUser
);

// Workspace management (scoped to current workspace only)
router.get("/workspace", ...adminOnly, adminController.getCurrentWorkspace);
// Add workspace deletion
router.delete("/workspace/:id", ...adminOnly, adminController.deleteWorkspace);

// Stats endpoint - temporarily without auth for testing
router.get("/stats", authMiddleware, adminController.getStats);

module.exports = router;