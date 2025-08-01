/**
 * FolderRoutes - Defines API endpoints for folder management.
 * All routes require authentication and are workspace-scoped.
 */

const express = require("express");
const router = express.Router();
const folderController = require("../controllers/folderController");
const authMiddleware = require("../middlewares/authMiddleware");

// All folder routes require authentication
const authenticatedOnly = [authMiddleware];

// Core folder operations
router.post("/", ...authenticatedOnly, folderController.createFolder);
router.get("/", ...authenticatedOnly, folderController.getUserFolders);
router.get("/:id", ...authenticatedOnly, folderController.getFolderById);
router.put("/:id", ...authenticatedOnly, folderController.updateFolder);
router.delete("/:id", ...authenticatedOnly, folderController.deleteFolder);

// Item management operations
router.post(
  "/:id/items",
  ...authenticatedOnly,
  folderController.addItemToFolder
);
router.delete(
  "/:id/items",
  ...authenticatedOnly,
  folderController.removeItemFromFolder
);
router.put(
  "/:id/reorder",
  ...authenticatedOnly,
  folderController.reorderFolderItems
);

module.exports = router;
