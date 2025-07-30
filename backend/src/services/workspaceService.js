const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

const prisma = new PrismaClient();

class WorkspaceService {
  /**
   * Get workspace details by ID
   * @param {string} workspaceId - The workspace ID
   * @returns {Promise<Object>} Workspace details
   */
  async getWorkspaceById(workspaceId) {
    try {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return workspace;
    } catch (error) {
      logger.error("Error in getWorkspaceById: %o", error);
      throw error;
    }
  }

  /**
   * Get workspace statistics
   * @param {string} workspaceId - The workspace ID
   * @returns {Promise<Object>} Workspace statistics
   */
  async getWorkspaceStats(workspaceId) {
    try {
      // Get workspace details first
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
          id: true,
          name: true,
        },
      });

      if (!workspace) {
        return null;
      }

      // Get total user count (all users)
      const totalUsers = await prisma.user.count({
        where: { workspaceId: workspaceId },
      });

      // Get member count (only users with MEMBER role)
      const memberCount = await prisma.user.count({
        where: {
          workspaceId: workspaceId,
          role: "MEMBER",
        },
      });

      return {
        workspace,
        stats: {
          members: memberCount, // Only MEMBER users
          personas: totalUsers, // Total users in workspace
        },
      };
    } catch (error) {
      logger.error("Error in getWorkspaceStats: %o", error);
      throw error;
    }
  }
}

module.exports = new WorkspaceService();
