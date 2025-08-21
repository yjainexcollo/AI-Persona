import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Save as SaveIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import AdminSidebar from "../components/sidebar/AdminSidebar";
import { Drawer } from "@mui/material";
import {
  getWorkspaceDetails,
  updateWorkspace,
  requestWorkspaceDeletion,
  type WorkspaceData,
} from "../services/workspaceService";

const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

const locales = [
  "en-US",
  "en-GB",
  "es-ES",
  "fr-FR",
  "de-DE",
  "it-IT",
  "pt-BR",
  "ja-JP",
  "zh-CN",
  "ko-KR",
];

const WorkspaceSettingsPage: React.FC = () => {
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    timezone: "",
    locale: "",
  });

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      setError("");

      const workspaceInfo = await getWorkspaceDetails();

      setWorkspace(workspaceInfo);
      setFormData({
        name: workspaceInfo.name || "",
        timezone: workspaceInfo.timezone || "UTC",
        locale: workspaceInfo.locale || "en-US",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load workspace data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspace) {
      setError("No workspace data available");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedWorkspace = await updateWorkspace(workspace.id, formData);
      setSuccess("Workspace updated successfully!");

      // Update local state with new data
      setWorkspace(updatedWorkspace);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update workspace"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (workspace) {
      setFormData({
        name: workspace.name || "",
        timezone: workspace.timezone || "UTC",
        locale: workspace.locale || "en-US",
      });
      setError("");
      setSuccess("");
    }
  };

  const handleDeleteWorkspace = () => {
    setDeleteDialogOpen(true);
    setDeleteReason("");
  };

  const handleConfirmDelete = async () => {
    if (!workspace) return;

    try {
      setDeleting(true);
      setError("");

      await requestWorkspaceDeletion(workspace.id, deleteReason || undefined);
      setSuccess(
        "Workspace deletion requested successfully. The workspace will be permanently deleted in 30 days."
      );

      // Close dialog
      setDeleteDialogOpen(false);
      setDeleteReason("");

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to request workspace deletion"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteReason("");
  };

  // Keep hooks above; render fallback UI inline to avoid conditional hook errors

  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <AdminSidebar />
      </Box>
      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{ sx: { width: 240 } }}
      >
        <AdminSidebar isDrawer />
      </Drawer>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          ml: { xs: 0, md: "220px" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            backgroundColor: "primary.main",
            color: "white",
          }}
        >
          <SettingsIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            Workspace Settings
          </Typography>
        </Box>
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, backgroundColor: "#f5f5f5" }}>
          {!workspace || loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "60vh",
              }}
            >
              {loading ? (
                <CircularProgress />
              ) : (
                <Typography variant="h6" color="error">
                  {error || "Failed to load workspace data"}
                </Typography>
              )}
            </Box>
          ) : (
            <Box sx={{ maxWidth: 800, mx: "auto" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <SettingsIcon
                  sx={{ mr: 2, fontSize: 32, color: "primary.main" }}
                />
                <Typography variant="h4" component="h1">
                  Workspace Settings
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                      General Settings
                    </Typography>

                    <form onSubmit={handleSubmit}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Workspace Name"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            required
                            helperText="Workspace name must be between 2 and 100 characters"
                            error={
                              formData.name.length > 0 &&
                              formData.name.length < 2
                            }
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Timezone</InputLabel>
                            <Select
                              value={formData.timezone}
                              label="Timezone"
                              onChange={(e) =>
                                handleInputChange("timezone", e.target.value)
                              }
                            >
                              {timezones.map((tz) => (
                                <MenuItem key={tz} value={tz}>
                                  {tz}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Locale</InputLabel>
                            <Select
                              value={formData.locale}
                              label="Locale"
                              onChange={(e) =>
                                handleInputChange("locale", e.target.value)
                              }
                            >
                              {locales.map((locale) => (
                                <MenuItem key={locale} value={locale}>
                                  {locale}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              justifyContent: "flex-end",
                            }}
                          >
                            <Button
                              variant="outlined"
                              onClick={handleReset}
                              disabled={saving}
                            >
                              Reset
                            </Button>
                            <Button
                              type="submit"
                              variant="contained"
                              startIcon={
                                saving ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <SaveIcon />
                                )
                              }
                              disabled={saving}
                            >
                              {saving ? "Saving..." : "Save Changes"}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </form>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardHeader title="Workspace Info" />
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Workspace ID
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {workspace.id}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Domain
                        </Typography>
                        <Typography variant="body1">
                          {workspace.domain || "Not set"}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Typography
                          variant="body1"
                          color={
                            workspace.isActive ? "success.main" : "error.main"
                          }
                        >
                          {workspace.isActive ? "Active" : "Inactive"}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Max Members
                        </Typography>
                        <Typography variant="body1">
                          {workspace.maxMembers}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Created
                        </Typography>
                        <Typography variant="body1">
                          {new Date(workspace.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Last Updated
                        </Typography>
                        <Typography variant="body1">
                          {new Date(workspace.updatedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Danger Zone Card */}
                  <Card sx={{ mt: 3, border: "2px solid #ff4444" }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Once you delete a workspace, there is no going back.
                        Please be certain.
                      </Typography>

                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteWorkspace}
                        fullWidth
                      >
                        Delete Workspace
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Box>

      {/* Delete Workspace Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: "error.main" }}>Delete Workspace</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to delete the workspace{" "}
            <strong>"{workspace?.name}"</strong>?
          </Typography>

          <Typography sx={{ mb: 2, color: "text.secondary" }}>
            This action will:
          </Typography>

          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <Typography component="li" sx={{ mb: 1 }}>
              Request workspace deletion (scheduled for 30 days from now)
            </Typography>
            <Typography component="li" sx={{ mb: 1 }}>
              Set workspace status to "Pending Deletion"
            </Typography>
            <Typography component="li" sx={{ mb: 1 }}>
              Permanently delete all workspace data after 30 days
            </Typography>
            <Typography component="li" sx={{ mb: 1 }}>
              Remove all members from the workspace
            </Typography>
          </Box>

          <Typography sx={{ mb: 2, color: "error.main", fontWeight: "bold" }}>
            This action cannot be undone!
          </Typography>

          <TextField
            fullWidth
            label="Reason for deletion (optional)"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            placeholder="e.g., No longer needed, migrating to another platform"
            multiline
            rows={3}
            helperText="Maximum 500 characters"
            inputProps={{ maxLength: 500 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={
              deleting ? <CircularProgress size={20} /> : <DeleteIcon />
            }
          >
            {deleting ? "Deleting..." : "Delete Workspace"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkspaceSettingsPage;
