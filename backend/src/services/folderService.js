/**
 * FolderService - Handles folder management for organizing conversations and personas.
 * Folders are workspace-scoped and user-owned for organizing content.
 *
 * Features:
 * - Create, update, delete folders
 * - Add/remove items (personas, conversations, sub-folders)
 * - List user's folders
 * - Get folder contents with items
 * - Reorder items within folders
 * - Workspace-scoped operations
 */

const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");
const ApiError = require("../utils/apiError");

const prisma = new PrismaClient();

/**
 * Create a new folder
 */
async function createFolder({ name, ownerId, workspaceId }) {
  if (!name || name.trim() === "") {
    throw new ApiError(400, "Folder name is required");
  }

  // Check if folder with same name already exists for this user
  const existingFolder = await prisma.folder.findFirst({
    where: {
      name: { equals: name.trim(), mode: "insensitive" },
      ownerId,
      workspaceId,
    },
  });

  if (existingFolder) {
    throw new ApiError(409, "Folder with this name already exists");
  }

  const folder = await prisma.folder.create({
    data: {
      name: name.trim(),
      ownerId,
      workspaceId,
      itemCount: 0,
    },
    select: {
      id: true,
      name: true,
      ownerId: true,
      workspaceId: true,
      itemCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  logger.info(
    `Created folder: ${folder.id} (${folder.name}) by user ${ownerId}`
  );
  return folder;
}

/**
 * Get user's folders
 */
async function getUserFolders({ ownerId, workspaceId }) {
  const folders = await prisma.folder.findMany({
    where: {
      ownerId,
      workspaceId,
    },
    select: {
      id: true,
      name: true,
      ownerId: true,
      workspaceId: true,
      itemCount: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { name: "asc" },
  });

  logger.info(`Retrieved ${folders.length} folders for user ${ownerId}`);
  return folders;
}

/**
 * Get folder by ID with contents
 */
async function getFolderById({ folderId, ownerId, workspaceId }) {
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      ownerId,
      workspaceId,
    },
    select: {
      id: true,
      name: true,
      ownerId: true,
      workspaceId: true,
      itemCount: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          itemType: true,
          itemId: true,
          order: true,
          addedAt: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!folder) {
    throw new ApiError(404, "Folder not found");
  }

  return folder;
}

/**
 * Update folder name
 */
async function updateFolder({ folderId, name, ownerId, workspaceId }) {
  if (!name || name.trim() === "") {
    throw new ApiError(400, "Folder name is required");
  }

  // Check if folder exists
  const existingFolder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      ownerId,
      workspaceId,
    },
  });

  if (!existingFolder) {
    throw new ApiError(404, "Folder not found");
  }

  // Check if new name conflicts with existing folder
  const nameConflict = await prisma.folder.findFirst({
    where: {
      name: { equals: name.trim(), mode: "insensitive" },
      ownerId,
      workspaceId,
      id: { not: folderId },
    },
  });

  if (nameConflict) {
    throw new ApiError(409, "Folder with this name already exists");
  }

  const folder = await prisma.folder.update({
    where: { id: folderId },
    data: { name: name.trim() },
    select: {
      id: true,
      name: true,
      ownerId: true,
      workspaceId: true,
      itemCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  logger.info(`Updated folder: ${folder.id} (${folder.name})`);
  return folder;
}

/**
 * Delete folder
 */
async function deleteFolder({ folderId, ownerId, workspaceId }) {
  // Check if folder exists
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      ownerId,
      workspaceId,
    },
  });

  if (!folder) {
    throw new ApiError(404, "Folder not found");
  }

  // Delete folder (cascade will delete folder items)
  await prisma.folder.delete({
    where: { id: folderId },
  });

  logger.info(`Deleted folder: ${folderId} (${folder.name})`);
  return { success: true };
}

/**
 * Add item to folder
 */
async function addItemToFolder({
  folderId,
  itemType,
  itemId,
  ownerId,
  workspaceId,
}) {
  // Validate folder exists and user owns it
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      ownerId,
      workspaceId,
    },
  });

  if (!folder) {
    throw new ApiError(404, "Folder not found");
  }

  // Validate item type
  if (!["PERSONA", "CONVERSATION", "FOLDER"].includes(itemType)) {
    throw new ApiError(
      400,
      "Invalid item type. Must be PERSONA, CONVERSATION, or FOLDER"
    );
  }

  // Check if item already exists in folder
  const existingItem = await prisma.folderItem.findUnique({
    where: {
      folderId_itemType_itemId: {
        folderId,
        itemType,
        itemId,
      },
    },
  });

  if (existingItem) {
    throw new ApiError(409, "Item already exists in folder");
  }

  // Get the next order number
  const maxOrder = await prisma.folderItem.aggregate({
    where: { folderId },
    _max: { order: true },
  });

  const nextOrder = (maxOrder._max.order || 0) + 1;

  // Add item to folder
  const folderItem = await prisma.folderItem.create({
    data: {
      folderId,
      itemType,
      itemId,
      order: nextOrder,
      userId: ownerId,
    },
    select: {
      id: true,
      folderId: true,
      itemType: true,
      itemId: true,
      order: true,
      addedAt: true,
    },
  });

  // Update folder item count
  await prisma.folder.update({
    where: { id: folderId },
    data: {
      itemCount: {
        increment: 1,
      },
    },
  });

  logger.info(`Added ${itemType} ${itemId} to folder ${folderId}`);
  return folderItem;
}

/**
 * Remove item from folder
 */
async function removeItemFromFolder({
  folderId,
  itemType,
  itemId,
  ownerId,
  workspaceId,
}) {
  // Validate folder exists and user owns it
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      ownerId,
      workspaceId,
    },
  });

  if (!folder) {
    throw new ApiError(404, "Folder not found");
  }

  // Find and delete the folder item
  const folderItem = await prisma.folderItem.findUnique({
    where: {
      folderId_itemType_itemId: {
        folderId,
        itemType,
        itemId,
      },
    },
  });

  if (!folderItem) {
    throw new ApiError(404, "Item not found in folder");
  }

  await prisma.folderItem.delete({
    where: {
      folderId_itemType_itemId: {
        folderId,
        itemType,
        itemId,
      },
    },
  });

  // Update folder item count
  await prisma.folder.update({
    where: { id: folderId },
    data: {
      itemCount: {
        decrement: 1,
      },
    },
  });

  logger.info(`Removed ${itemType} ${itemId} from folder ${folderId}`);
  return { success: true };
}

/**
 * Reorder items in folder
 */
async function reorderFolderItems({
  folderId,
  itemOrders,
  ownerId,
  workspaceId,
}) {
  // Validate folder exists and user owns it
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      ownerId,
      workspaceId,
    },
  });

  if (!folder) {
    throw new ApiError(404, "Folder not found");
  }

  // Update item orders
  for (const { itemId, order } of itemOrders) {
    await prisma.folderItem.updateMany({
      where: {
        folderId,
        itemId,
      },
      data: { order },
    });
  }

  logger.info(`Reordered items in folder ${folderId}`);
  return { success: true };
}

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
