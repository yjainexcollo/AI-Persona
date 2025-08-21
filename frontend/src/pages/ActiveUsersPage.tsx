import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Drawer,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  InputAdornment,
  Checkbox,
  Tooltip,
  Pagination,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AdminSidebar from "../components/sidebar/AdminSidebar";
import { fetchWithAuth } from "../utils/session";
import { logout } from "../services/authService";
import { getAvatarUrl } from "../services/avatarService";
import {
  getWorkspaceDetails,
  getWorkspaceMembers,
  changeMemberStatus,
  changeMemberRole,
  removeMember,
  type WorkspaceMember,
} from "../services/workspaceService";

const ActiveUsersPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [memberDetails, setMemberDetails] = useState<WorkspaceMember | null>(
    null
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [totalMembers, setTotalMembers] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedMemberForStatus, setSelectedMemberForStatus] =
    useState<WorkspaceMember | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get workspace ID and fetch members
  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get workspace details to get workspace ID
      const workspace = await getWorkspaceDetails();
      setWorkspaceId(workspace.id);

      // Fetch members
      await fetchMembers(workspace.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load workspace data"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (wsId: string, currentPage = 1) => {
    try {
      const response = await getWorkspaceMembers(wsId, {
        search: search || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
        page: currentPage,
        limit,
      });

      setMembers(response.data);
      setTotalMembers(response.pagination.total);
      setPage(currentPage);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError(err instanceof Error ? err.message : "Failed to load members");
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (workspaceId) {
      fetchMembers(workspaceId, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, roleFilter, workspaceId]);

  const handleCheck = (idx: number) => {
    setChecked((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleViewDetails = (member: WorkspaceMember) => {
    setMemberDetails(member);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setMemberDetails(null);
  };

  const handleActivateMember = async (memberId: string) => {
    if (!workspaceId) return;

    try {
      setActionLoading(true);
      await changeMemberStatus(workspaceId, memberId, "ACTIVE");
      setSuccessMessage("Member activated successfully!");

      // Refresh members list
      await fetchMembers(workspaceId, page);
      setDetailsOpen(false);
      setMemberDetails(null);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to activate member"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivateMember = async (memberId: string) => {
    if (!workspaceId) return;

    try {
      setActionLoading(true);
      setError(""); // Clear any previous errors

      await changeMemberStatus(workspaceId, memberId, "DEACTIVATED");
      setSuccessMessage("Member deactivated successfully!");

      // Refresh members list
      await fetchMembers(workspaceId, page);
      setDetailsOpen(false);
      setMemberDetails(null);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to deactivate member";
      setError(errorMessage);

      // Clear error after 5 seconds
      setTimeout(() => setError(""), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    if (!workspaceId) return;

    try {
      setActionLoading(true);
      setError(""); // Clear any previous errors

      await changeMemberRole(workspaceId, memberId, newRole);
      setSuccessMessage("Member role updated successfully!");

      // Refresh members list
      await fetchMembers(workspaceId, page);
      setDetailsOpen(false);
      setMemberDetails(null);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to change member role";
      setError(errorMessage);

      // Clear error after 5 seconds
      setTimeout(() => setError(""), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!workspaceId) return;

    if (
      !window.confirm(
        "Are you sure you want to remove this member from the workspace?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError(""); // Clear any previous errors

      await removeMember(workspaceId, memberId);
      setSuccessMessage("Member removed successfully!");

      // Refresh members list
      await fetchMembers(workspaceId, page);
      setDetailsOpen(false);
      setMemberDetails(null);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove member";
      setError(errorMessage);

      // Clear error after 5 seconds
      setTimeout(() => setError(""), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusClick = (member: WorkspaceMember) => {
    setSelectedMemberForStatus(member);
    setStatusDialogOpen(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!workspaceId || !selectedMemberForStatus) return;

    try {
      setActionLoading(true);
      setError(""); // Clear any previous errors

      await changeMemberStatus(
        workspaceId,
        selectedMemberForStatus.id,
        newStatus
      );
      setSuccessMessage(`Member status changed to ${newStatus} successfully!`);

      // Refresh members list
      await fetchMembers(workspaceId, page);
      setStatusDialogOpen(false);
      setSelectedMemberForStatus(null);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to change member status";
      setError(errorMessage);

      // Clear error after 5 seconds
      setTimeout(() => setError(""), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedMemberForStatus(null);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    if (workspaceId) {
      fetchMembers(workspaceId, value);
    }
  };

  const getStatusColor = (
    status: string
  ): "success" | "error" | "warning" | "default" => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "DEACTIVATED":
        return "error";
      case "PENDING_VERIFY":
        return "warning";
      default:
        return "default";
    }
  };

  const getRoleColor = (role: string): "primary" | "default" => {
    return role === "ADMIN" ? "primary" : "default";
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Typography>Loading workspace members...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const handleSignOut = () => {
    logout();
  };

  // Check if user has admin role
  if (user.role !== "ADMIN") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Typography color="error" variant="h6">
          Access denied. Admin role required.
        </Typography>
      </Box>
    );
  }

  const totalPages = Math.ceil(totalMembers / limit);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f7f8fa" }}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <AdminSidebar
          userRole={user.role}
          currentTab="users"
          onSignOut={handleSignOut}
        />
      </Box>
      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{ sx: { width: 240 } }}
      >
        <AdminSidebar
          userRole={user.role}
          currentTab="users"
          onSignOut={handleSignOut}
          isDrawer
        />
      </Drawer>
      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          ml: { xs: 0, md: "220px" },
          minWidth: 0,
        }}
      >
        {/* Header (matches Dashboard) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            px: { xs: 2, md: 6 },
            pt: { xs: 2, md: 3 },
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: 18, md: 24 },
                color: "#222",
              }}
            >
              Workspace Members
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "#2950DA",
                  opacity: 0.7,
                }}
              />
              <Typography sx={{ color: "#666", fontSize: 12 }}>
                {totalMembers} members
              </Typography>
            </Box>
          </Box>
          <TextField
            placeholder="Search members..."
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#bdbdbd" }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                bgcolor: "#fff",
                width: { xs: 220, sm: 320 },
                fontSize: 16,
              },
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2, mx: { xs: 2, md: 6 } }}>
            {successMessage}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, mx: { xs: 2, md: 6 } }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 3,
              flexWrap: "wrap",
            }}
          >
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) =>
                  setStatusFilter(
                    (e.target.value || "").toString().toUpperCase()
                  )
                }
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="DEACTIVATED">Deactivated</MenuItem>
                <MenuItem value="PENDING_VERIFY">Pending Verify</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) =>
                  setRoleFilter((e.target.value || "").toString().toUpperCase())
                }
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="MEMBER">Member</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, fontSize: { xs: 14, md: 16 } }}
                  >
                    Member ID
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, fontSize: { xs: 14, md: 16 } }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, fontSize: { xs: 14, md: 16 } }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, fontSize: { xs: 14, md: 16 } }}
                  >
                    Role
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, fontSize: { xs: 14, md: 16 } }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, fontSize: { xs: 14, md: 16 } }}
                  >
                    Joined
                  </TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member, idx) => (
                  <TableRow key={member.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={checked.includes(idx)}
                        onChange={() => handleCheck(idx)}
                        icon={<CheckBoxOutlineBlankIcon />}
                        checkedIcon={<CheckBoxIcon sx={{ color: "#2950DA" }} />}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: 12, md: 16 },
                        fontFamily: "monospace",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {member.id}
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: { xs: 14, md: 16 } }}
                    >
                      {member.name}
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: { xs: 14, md: 16 } }}
                    >
                      {member.email}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.role}
                        color={getRoleColor(member.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.status}
                        color={getStatusColor(member.status)}
                        size="small"
                        onClick={() => handleStatusClick(member)}
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            opacity: 0.8,
                            transform: "scale(1.05)",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: { xs: 14, md: 16 } }}
                    >
                      {new Date(member.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View details">
                        <IconButton onClick={() => handleViewDetails(member)}>
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 3,
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                size="large"
              />
            </Box>
          )}
        </Paper>
      </Box>

      {/* Member Details Modal */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Member Details</DialogTitle>
        <DialogContent>
          {memberDetails ? (
            <Box>
              <Typography>
                <b>ID:</b> {memberDetails.id}
              </Typography>
              <Typography>
                <b>Name:</b> {memberDetails.name}
              </Typography>
              <Typography>
                <b>Email:</b> {memberDetails.email}
              </Typography>
              <Typography>
                <b>Role:</b> {memberDetails.role}
              </Typography>
              <Typography>
                <b>Status:</b> {memberDetails.status}
              </Typography>
              <Typography>
                <b>Last Login:</b>{" "}
                {memberDetails.lastLoginAt
                  ? new Date(memberDetails.lastLoginAt).toLocaleString()
                  : "Never"}
              </Typography>
              <Typography>
                <b>Joined:</b>{" "}
                {new Date(memberDetails.createdAt).toLocaleString()}
              </Typography>

              <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                {memberDetails.status !== "ACTIVE" && (
                  <Button
                    color="success"
                    variant="contained"
                    onClick={() => handleActivateMember(memberDetails.id)}
                    disabled={actionLoading}
                  >
                    Activate Member
                  </Button>
                )}

                {memberDetails.status === "ACTIVE" && (
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() => handleDeactivateMember(memberDetails.id)}
                    disabled={actionLoading || memberDetails.role === "ADMIN"}
                    title={
                      memberDetails.role === "ADMIN"
                        ? "Cannot deactivate an admin. Please change their role to Member first."
                        : "Deactivate this member"
                    }
                  >
                    Deactivate Member
                  </Button>
                )}

                {memberDetails.role === "MEMBER" && (
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={() => handleChangeRole(memberDetails.id, "ADMIN")}
                    disabled={actionLoading}
                  >
                    Make Admin
                  </Button>
                )}

                {memberDetails.role === "ADMIN" && (
                  <Button
                    color="warning"
                    variant="outlined"
                    onClick={() => handleChangeRole(memberDetails.id, "MEMBER")}
                    disabled={
                      actionLoading ||
                      members.filter(
                        (m) => m.role === "ADMIN" && m.status === "ACTIVE"
                      ).length === 1
                    }
                    title={
                      members.filter(
                        (m) => m.role === "ADMIN" && m.status === "ACTIVE"
                      ).length === 1
                        ? "Cannot demote the only admin in the workspace"
                        : "Change role to Member"
                    }
                  >
                    Make Member
                  </Button>
                )}

                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => handleRemoveMember(memberDetails.id)}
                  disabled={
                    actionLoading ||
                    (memberDetails.role === "ADMIN" &&
                      members.filter(
                        (m) => m.role === "ADMIN" && m.status === "ACTIVE"
                      ).length === 1)
                  }
                  title={
                    memberDetails.role === "ADMIN" &&
                    members.filter(
                      (m) => m.role === "ADMIN" && m.status === "ACTIVE"
                    ).length === 1
                      ? "Cannot remove the only admin from the workspace"
                      : "Remove this member from the workspace"
                  }
                >
                  Remove Member
                </Button>
              </Box>

              {/* Show warning if this is the only admin */}
              {memberDetails.role === "ADMIN" &&
                members.filter(
                  (m) => m.role === "ADMIN" && m.status === "ACTIVE"
                ).length === 1 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    This is the only admin in the workspace. At least one admin
                    must remain to manage the workspace.
                  </Alert>
                )}

              {/* Show info about admin deactivation */}
              {memberDetails.role === "ADMIN" &&
                memberDetails.status === "ACTIVE" && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Admins cannot be deactivated directly. Please change their
                    role to Member first, then deactivate them.
                  </Alert>
                )}

              {/* Show warning if this is the only admin for removal */}
              {memberDetails.role === "ADMIN" &&
                members.filter(
                  (m) => m.role === "ADMIN" && m.status === "ACTIVE"
                ).length === 1 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    This is the only admin in the workspace. At least one admin
                    must remain to manage the workspace.
                  </Alert>
                )}
            </Box>
          ) : (
            <Typography>No details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Member Status</DialogTitle>
        <DialogContent>
          {selectedMemberForStatus ? (
            <Box>
              <Typography sx={{ mb: 2 }}>
                Change status for{" "}
                <strong>{selectedMemberForStatus.name}</strong> (
                {selectedMemberForStatus.email})
              </Typography>

              <Typography sx={{ mb: 2 }}>
                Current status:{" "}
                <Chip
                  label={selectedMemberForStatus.status}
                  color={getStatusColor(selectedMemberForStatus.status)}
                  size="small"
                />
              </Typography>

              <Typography sx={{ mb: 2, color: "text.secondary" }}>
                Select new status:
              </Typography>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {selectedMemberForStatus.status !== "ACTIVE" && (
                  <Button
                    color="success"
                    variant="outlined"
                    onClick={() => handleStatusChange("ACTIVE")}
                    disabled={actionLoading}
                  >
                    Activate
                  </Button>
                )}

                {selectedMemberForStatus.status === "ACTIVE" && (
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() => handleStatusChange("DEACTIVATED")}
                    disabled={
                      actionLoading || selectedMemberForStatus.role === "ADMIN"
                    }
                    title={
                      selectedMemberForStatus.role === "ADMIN"
                        ? "Cannot deactivate an admin. Please change their role to Member first."
                        : "Deactivate this member"
                    }
                  >
                    Deactivate
                  </Button>
                )}

                {selectedMemberForStatus.status !== "PENDING_VERIFY" && (
                  <Button
                    color="warning"
                    variant="outlined"
                    onClick={() => handleStatusChange("PENDING_VERIFY")}
                    disabled={actionLoading}
                  >
                    Set Pending Verify
                  </Button>
                )}
              </Box>

              {/* Show warning if trying to deactivate admin */}
              {selectedMemberForStatus.role === "ADMIN" &&
                selectedMemberForStatus.status === "ACTIVE" && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Admins cannot be deactivated directly. Please change their
                    role to Member first, then deactivate them.
                  </Alert>
                )}
            </Box>
          ) : (
            <Typography>No member selected.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActiveUsersPage;
