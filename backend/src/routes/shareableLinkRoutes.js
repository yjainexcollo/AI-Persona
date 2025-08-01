/**
 * ShareableLinkRoutes - Defines API endpoints for shareable link management.
 * All /api/shareable-links routes require authentication and are workspace-scoped.
 * /api/share/:token is public (no authentication required).
 */

const express = require("express");
const router = express.Router();
const shareableLinkController = require("../controllers/shareableLinkController");
const authMiddleware = require("../middlewares/authMiddleware");

// All /api/shareable-links routes require authentication
const authenticatedOnly = [authMiddleware];

// Core shareable link operations
router.post(
  "/",
  ...authenticatedOnly,
  shareableLinkController.createShareableLink
);
router.get(
  "/",
  ...authenticatedOnly,
  shareableLinkController.getUserShareableLinks
);
router.get(
  "/stats",
  ...authenticatedOnly,
  shareableLinkController.getShareableLinkStats
);
router.get(
  "/:id",
  ...authenticatedOnly,
  shareableLinkController.getShareableLinkById
);
router.delete(
  "/:id",
  ...authenticatedOnly,
  shareableLinkController.deleteShareableLink
);

// Public access to conversation by token (no authentication required)
router.get("/share/:token", shareableLinkController.getConversationByToken);

module.exports = router;
