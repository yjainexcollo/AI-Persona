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
import { colors, spacing, typography } from "../styles/tokens";
import { fetchWithAuth } from "../utils/session";
import { logout } from "../services/authService";
import { getAvatarUrl } from "../services/avatarService";
import {
  getWorkspaceDetails,
  getWorkspaceMembers,
  changeMemberStatus,
  type WorkspaceMember,
} from "../services/workspaceService";

const AdminListPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  type AdminUser = WorkspaceMember;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userDetails, setUserDetails] = useState<AdminUser | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [totalAdmins, setTotalAdmins] = useState<number>(0);

  const handleActivateUser = async (userId: string) => {
    try {
      if (!workspaceId) throw new Error("Workspace not loaded");
      await changeMemberStatus(workspaceId, userId, "ACTIVE");
      await fetchUsers();
      setDetailsOpen(false);
      setUserDetails(null);
    } catch {
      alert("Failed to activate user.");
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      if (!workspaceId) throw new Error("Workspace not loaded");
      await changeMemberStatus(workspaceId, userId, "DEACTIVATED");
      await fetchUsers();
      setDetailsOpen(false);
      setUserDetails(null);
    } catch {
      alert("Failed to deactivate user.");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      if (!workspaceId) {
        const ws = await getWorkspaceDetails();
        setWorkspaceId(ws.id);
      }
      const id = workspaceId || (await getWorkspaceDetails()).id;
      const response = await getWorkspaceMembers(id, {
        role: "ADMIN",
        page,
        limit: 10,
        search: search || undefined,
      });
      setUsers(response.data as AdminUser[]);
      setTotalAdmins(response.pagination.total);
    } catch {
      setError("Failed to load admin users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const usersInterval = setInterval(fetchUsers, 30000);
    return () => clearInterval(usersInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleCheck = (idx: number) => {
    setChecked((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleViewDetails = async (userId: string) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setUserDetails(user);
        setDetailsOpen(true);
      } else {
        throw new Error("User not found");
      }
    } catch {
      setUserDetails(null);
      setDetailsOpen(false);
      alert("Failed to load user details");
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setUserDetails(null);
  };

  const handleSignOut = () => {
    logout();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const itemsPerPage = 10;
  const paginatedUsers = filteredUsers; // server-paginated already

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f7f8fa" }}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <AdminSidebar
          userRole={
            JSON.parse(localStorage.getItem("user") || "{}").role || "MEMBER"
          }
          currentTab="admins"
          onSignOut={handleSignOut}
        />
      </Box>
      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{ sx: { width: 240 } }}
      >
        <AdminSidebar
          userRole={
            JSON.parse(localStorage.getItem("user") || "{}").role || "MEMBER"
          }
          currentTab="admins"
          onSignOut={handleSignOut}
          isDrawer
        />
      </Drawer>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          ml: { xs: 0, md: "220px" },
          minWidth: 0,
          px: spacing.pagePx,
          py: spacing.pagePy,
        }}
      >
        {/* Header (match ActiveUsersPage / Dashboard look) */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            pt: { xs: 2, md: 3 },
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <Box>
              <Typography
                sx={{
                  fontWeight: typography.title.weight,
                  fontSize: {
                    xs: typography.title.xs,
                    md: typography.title.md,
                  },
                  color: colors.textPrimary,
                }}
              >
                Admin Users
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: colors.primary,
                    opacity: 0.7,
                  }}
                />
                <Typography
                  sx={{
                    color: colors.textSecondary,
                    fontSize: typography.caption.size,
                  }}
                >
                  {totalAdmins} admins
                </Typography>
              </Box>
            </Box>
          </Box>
          <TextField
            placeholder="Search admin users..."
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

        {/* Users Table */}
        <Paper elevation={0} sx={{ borderRadius: 3, p: { xs: 2, md: 3 } }}>
          <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, fontSize: { xs: 14, md: 16 } }}
                  >
                    User ID
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, fontSize: { xs: 14, md: 16 } }}
                  >
                    User Name
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, fontSize: { xs: 14, md: 16 } }}
                  >
                    User Type
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, fontSize: { xs: 14, md: 16 } }}
                  >
                    Status
                  </TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                      <Typography>Loading admin users...</Typography>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      sx={{ textAlign: "center", py: 4, color: "error.main" }}
                    >
                      <Typography>{error}</Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                      <Typography>No admin users found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={checked.includes(index)}
                          onChange={() => handleCheck(index)}
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={
                            <CheckBoxIcon sx={{ color: "#2950DA" }} />
                          }
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: 12, md: 16 },
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.id}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, fontSize: { xs: 14, md: 16 } }}
                      >
                        {user.name}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, fontSize: { xs: 14, md: 16 } }}
                      >
                        {user.role}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, fontSize: { xs: 14, md: 16 } }}
                      >
                        {user.status === "ACTIVE" ? "Active" : "Inactive"}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleViewDetails(user.id)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {totalAdmins > itemsPerPage && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 3,
              }}
            >
              <Pagination
                count={Math.ceil((totalAdmins || 0) / itemsPerPage)}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="primary"
                shape="rounded"
                size="large"
              />
            </Box>
          )}
        </Paper>
      </Box>

      {/* User Details Modal */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {userDetails ? (
            <Box>
              <Typography>
                <b>ID:</b> {userDetails.id}
              </Typography>
              <Typography>
                <b>Name:</b> {userDetails.name}
              </Typography>
              <Typography>
                <b>Email:</b> {userDetails.email}
              </Typography>
              <Typography>
                <b>User Type:</b> {userDetails.role}
              </Typography>
              <Typography>
                <b>Active:</b> {userDetails.status === "ACTIVE" ? "Yes" : "No"}
              </Typography>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          {userDetails && (
            <>
              {userDetails.status === "ACTIVE" ? (
                <Button
                  onClick={() => handleDeactivateUser(userDetails.id)}
                  color="warning"
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  onClick={() => handleActivateUser(userDetails.id)}
                  color="success"
                >
                  Activate
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminListPage;
