/**
 * FolderController - Handles HTTP requests for folder management.
 * Provides RESTful endpoints for folder CRUD operations and item management.
 */

const folderService = require("../services/folderService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

// POST /api/folders
const createFolder = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");
  if (!name) throw new ApiError(400, "Folder name is required");

  const folder = await folderService.createFolder({
    name,
    ownerId: userId,
    workspaceId,
  });

  res.status(201).json({
    status: "success",
    message: "Folder created successfully",
    data: { folder },
  });
});

// GET /api/folders
const getUserFolders = asyncHandler(async (req, res) => {
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");

  const folders = await folderService.getUserFolders({
    ownerId: userId,
    workspaceId,
  });

  res.status(200).json({
    status: "success",
    message: "Folders retrieved successfully",
    data: { folders },
  });
});

// GET /api/folders/:id
const getFolderById = asyncHandler(async (req, res) => {
  const { id: folderId } = req.params;
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");
  if (!folderId) throw new ApiError(400, "Folder ID is required");

  const folder = await folderService.getFolderById({
    folderId,
    ownerId: userId,
    workspaceId,
  });

  res.status(200).json({
    status: "success",
    message: "Folder retrieved successfully",
    data: { folder },
  });
});

// PUT /api/folders/:id
const updateFolder = asyncHandler(async (req, res) => {
  const { id: folderId } = req.params;
  const { name } = req.body;
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");
  if (!folderId) throw new ApiError(400, "Folder ID is required");
  if (!name) throw new ApiError(400, "Folder name is required");

  const folder = await folderService.updateFolder({
    folderId,
    name,
    ownerId: userId,
    workspaceId,
  });

  res.status(200).json({
    status: "success",
    message: "Folder updated successfully",
    data: { folder },
  });
});

// DELETE /api/folders/:id
const deleteFolder = asyncHandler(async (req, res) => {
  const { id: folderId } = req.params;
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");
  if (!folderId) throw new ApiError(400, "Folder ID is required");

  await folderService.deleteFolder({ folderId, ownerId: userId, workspaceId });

  res.status(200).json({
    status: "success",
    message: "Folder deleted successfully",
  });
});

// POST /api/folders/:id/items
const addItemToFolder = asyncHandler(async (req, res) => {
  const { id: folderId } = req.params;
  const { itemType, itemId } = req.body;
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");
  if (!folderId) throw new ApiError(400, "Folder ID is required");
  if (!itemType) throw new ApiError(400, "Item type is required");
  if (!itemId) throw new ApiError(400, "Item ID is required");

  const folderItem = await folderService.addItemToFolder({
    folderId,
    itemType,
    itemId,
    ownerId: userId,
    workspaceId,
  });

  res.status(201).json({
    status: "success",
    message: "Item added to folder successfully",
    data: { folderItem },
  });
});

// DELETE /api/folders/:id/items
const removeItemFromFolder = asyncHandler(async (req, res) => {
  const { id: folderId } = req.params;
  const { itemType, itemId } = req.body;
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");
  if (!folderId) throw new ApiError(400, "Folder ID is required");
  if (!itemType) throw new ApiError(400, "Item type is required");
  if (!itemId) throw new ApiError(400, "Item ID is required");

  await folderService.removeItemFromFolder({
    folderId,
    itemType,
    itemId,
    ownerId: userId,
    workspaceId,
  });

  res.status(200).json({
    status: "success",
    message: "Item removed from folder successfully",
  });
});

// PUT /api/folders/:id/reorder
const reorderFolderItems = asyncHandler(async (req, res) => {
  const { id: folderId } = req.params;
  const { itemOrders } = req.body;
  const userId = req.user && req.user.id;
  const workspaceId = req.user && req.user.workspaceId;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!workspaceId) throw new ApiError(400, "Workspace not found");
  if (!folderId) throw new ApiError(400, "Folder ID is required");
  if (!itemOrders || !Array.isArray(itemOrders)) {
    throw new ApiError(400, "Item orders array is required");
  }

  await folderService.reorderFolderItems({
    folderId,
    itemOrders,
    ownerId: userId,
    workspaceId,
  });

  res.status(200).json({
    status: "success",
    message: "Items reordered successfully",
  });
});

module.exports = {
  createFolder,
  getUserFolders,
  getFolderById,
  updateFolder,
  deleteFolder,
  addItemToFolder,
  removeItemFromFolder,
  reorderFolderItems,
};
