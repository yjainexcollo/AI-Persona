const express = require("express");
const router = express.Router();
const workspaceController = require("../controllers/workspaceController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  validateWorkspaceUpdate,
  validateRoleChange,
  validateWorkspaceId,
  validateMemberId,
  validateDeletionRequest,
  validateMembersListQuery,
  validateRolePatch,
  validateStatusPatch,
} = require("../middlewares/validationMiddleware");

// Routes
// GET /api/workspaces/:id
router.get(
  "/:id",
  authMiddleware,
  validateWorkspaceId,
  workspaceController.getWorkspace
);

// PUT /api/workspaces/:id
router.put(
  "/:id",
  authMiddleware,
  validateWorkspaceId,
  validateWorkspaceUpdate,
  roleMiddleware("ADMIN"),
  workspaceController.updateWorkspace
);

// GET /api/workspaces/:id/members (Smart listing with query params)
router.get(
  "/:id/members",
  authMiddleware,
  validateWorkspaceId,
  validateMembersListQuery,
  roleMiddleware("ADMIN"),
  workspaceController.listMembers
);

// PATCH /api/workspaces/:id/members/:uid/role
router.patch(
  "/:id/members/:uid/role",
  authMiddleware,
  validateWorkspaceId,
  validateMemberId,
  validateRolePatch,
  roleMiddleware("ADMIN"),
  workspaceController.changeRole
);

// PATCH /api/workspaces/:id/members/:uid/status
router.patch(
  "/:id/members/:uid/status",
  authMiddleware,
  validateWorkspaceId,
  validateMemberId,
  validateStatusPatch,
  roleMiddleware("ADMIN"),
  workspaceController.changeStatus
);

// POST /api/workspaces/:id/members/:uid/force-reset
router.post(
  "/:id/members/:uid/force-reset",
  authMiddleware,
  validateWorkspaceId,
  validateMemberId,
  roleMiddleware("ADMIN"),
  workspaceController.forcePasswordReset
);

// DELETE /api/workspaces/:id/members/:uid
router.delete(
  "/:id/members/:uid",
  authMiddleware,
  validateWorkspaceId,
  validateMemberId,
  roleMiddleware("ADMIN"),
  workspaceController.removeMember
);

// POST /api/workspaces/:id/delete
router.post(
  "/:id/delete",
  authMiddleware,
  validateWorkspaceId,
  validateDeletionRequest,
  roleMiddleware("ADMIN"),
  workspaceController.requestDeletion
);

module.exports = router;
