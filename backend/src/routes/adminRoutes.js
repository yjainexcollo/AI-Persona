const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// All routes require ADMIN role
const adminOnly = [authMiddleware, roleMiddleware(["ADMIN"])];

// User management
router.get("/users", ...adminOnly, adminController.listUsers);
router.get("/users/:id", ...adminOnly, adminController.getUser);
router.post("/users/:id/activate", ...adminOnly, adminController.activateUser);
router.post(
  "/users/:id/deactivate",
  ...adminOnly,
  adminController.deactivateUser
);

// Stats endpoint
router.get("/stats", authMiddleware, adminController.getStats);

module.exports = router;
