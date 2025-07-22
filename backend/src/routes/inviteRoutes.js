const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const attachWorkspace = require("../middlewares/attachWorkspace");
const inviteController = require("../controllers/inviteController");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Send invite (authenticated, workspace-scoped)
router.post(
  "/send",
  authMiddleware,
  attachWorkspace,
  roleMiddleware("admin"),
  inviteController.sendInvite
);

// Accept invite (public, no workspace context needed)
router.post("/accept", inviteController.acceptInvite);

module.exports = router;
