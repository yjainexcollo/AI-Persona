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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { fetchWithAuth } from "../utils/session";
import AdminSidebar from "../components/sidebar/AdminSidebar";
import { logout } from "../services/authService";
import { colors, spacing, typography } from "../styles/tokens";
import { getAvatarUrl } from "../services/avatarService";
import { env } from "../lib/config/env";

const ProfilePage: React.FC = () => {
  interface UserProfile {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    avatarUrl?: string;
  }
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editNameDialog, setEditNameDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  // Avatar upload states
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const BACKEND_URL = env.BACKEND_URL;
        const res = await fetchWithAuth(`${BACKEND_URL}/api/users/me`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data.data.user);
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSignOut = () => {
    logout();
  };

  // Avoid conditional hooks: show inline loading/error later in JSX

  const handleEditName = () => {
    setNewName(profile?.name || "");
    setEditNameDialog(true);
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const BACKEND_URL = env.BACKEND_URL;
      const res = await fetchWithAuth(`${BACKEND_URL}/api/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update name");

      // Update local profile state
      setProfile({ ...profile, name: newName.trim() });

      // Update localStorage user data
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, name: newName.trim() };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setEditNameDialog(false);
      setNewName("");
    } catch {
      alert("Failed to update name. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (
      !window.confirm(
        "Are you sure you want to deactivate your account? This action cannot be undone."
      )
    )
      return;
    try {
      const BACKEND_URL = env.BACKEND_URL;
      const res = await fetchWithAuth(`${BACKEND_URL}/api/auth/deactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to deactivate account");
      // Clear localStorage and redirect to login
      localStorage.clear();
      window.location.href = "/login";
    } catch {
      alert("Failed to deactivate account. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action is permanent and cannot be undone. Your account will be permanently deleted in 30 days."
      )
    )
      return;
    try {
      const BACKEND_URL = env.BACKEND_URL;
      const res = await fetchWithAuth(
        `${BACKEND_URL}/api/auth/delete-account`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!res.ok) throw new Error("Failed to delete account");

      // Show success message and redirect
      alert(
        "Account deletion requested. Your account will be permanently deleted in 30 days."
      );
      localStorage.clear();
      window.location.href = "/login";
    } catch {
      alert("Failed to delete account. Please try again.");
    }
  };

  // Avatar upload functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size too large. Maximum size is 2MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;

    setAvatarUploading(true);
    try {
      const BACKEND_URL = env.BACKEND_URL;
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const res = await fetchWithAuth(`${BACKEND_URL}/api/users/me/avatar`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload avatar");
      }

      const data = await res.json();

      // Update profile with new avatar URL
      setProfile({ ...profile, avatarUrl: data.data.avatarUrl });

      // Update localStorage user data
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, avatar: data.data.avatarUrl };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Clear preview and selected file
      setPreviewUrl(null);
      setSelectedFile(null);

      alert("Avatar uploaded successfully!");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to upload avatar. Please try again."
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f7f8fa" }}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <AdminSidebar
          userRole={user.role}
          currentTab="profile"
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
          currentTab="profile"
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
        }}
      >
        {/* Content */}
        <Box sx={{ flex: 1, px: spacing.pagePx, py: spacing.pagePy }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
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
                Profile
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
                  {profile?.email || ""}
                </Typography>
              </Box>
            </Box>
          </Box>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "40vh",
              }}
            >
              <Typography>Loading profile...</Typography>
            </Box>
          ) : error ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "40vh",
              }}
            >
              <Typography color="error">{error}</Typography>
            </Box>
          ) : null}
        </Box>
        {/* Profile Card */}
        {!loading && !error && (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              p: 0,
              mb: 4,
              overflow: "hidden",
              bgcolor: colors.surfaceMuted,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 5,
                position: "relative",
                minHeight: 220,
              }}
            >
              <Box
                sx={{ position: "relative", width: 140, height: 140, mb: 2 }}
              >
                <Avatar
                  src={previewUrl || getAvatarUrl(profile?.avatarUrl)}
                  sx={{
                    width: 140,
                    height: 140,
                    bgcolor: "#e6e6e6",
                    fontSize: 80,
                  }}
                >
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="8"
                      r="4"
                      stroke="#222"
                      strokeWidth="2"
                    />
                    <path
                      d="M4 20c0-4 4-7 8-7s8 3 8 7"
                      stroke="#222"
                      strokeWidth="2"
                    />
                  </svg>
                </Avatar>
                <Box
                  onClick={handleAvatarClick}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    bgcolor: "rgba(0,0,0,0.15)",
                    borderRadius: "50%",
                    transition: "background 0.2s",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.25)" },
                  }}
                >
                  <PhotoCameraIcon sx={{ color: "#fff", fontSize: 32 }} />
                </Box>
              </Box>

              {/* Avatar upload preview and controls */}
              {selectedFile && (
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography sx={{ color: "#666", fontSize: 14 }}>
                    Selected: {selectedFile.name}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={avatarUploading}
                      onClick={handleAvatarUpload}
                      sx={{
                        bgcolor: "#2950DA",
                        color: "#fff",
                        "&:hover": { bgcolor: "#526794" },
                        "&:disabled": { bgcolor: "#ccc" },
                      }}
                    >
                      {avatarUploading ? (
                        <>
                          <CircularProgress
                            size={16}
                            sx={{ color: "#fff", mr: 1 }}
                          />
                          Uploading...
                        </>
                      ) : (
                        "Upload Avatar"
                      )}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={avatarUploading}
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      sx={{
                        borderColor: "#666",
                        color: "#666",
                        "&:hover": { borderColor: "#333", color: "#333" },
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
              >
                <Typography
                  sx={{ fontWeight: 700, fontSize: 22, color: "#222" }}
                >
                  {profile?.name || "N/A"}
                </Typography>
                <IconButton
                  onClick={handleEditName}
                  sx={{
                    p: 0.5,
                    color: "#2950DA",
                    "&:hover": {
                      bgcolor: "rgba(41, 80, 218, 0.08)",
                    },
                  }}
                >
                  <EditIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
              <Typography
                sx={{ color: "#888", fontWeight: 600, fontSize: 17, mb: 2 }}
              >
                {profile?.role || "User"}
              </Typography>
            </Box>
          </Paper>
        )}
        {/* Info Cards */}
        {!loading && !error && (
          <Box
            sx={{
              maxWidth: 600,
              mx: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              px: { xs: 2, md: 0 },
            }}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                p: 0,
                display: "flex",
                alignItems: "center",
                minHeight: 64,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#F5F7FA",
                  borderRadius: 2,
                }}
              >
                <EmailOutlinedIcon sx={{ fontSize: 32, color: "#888" }} />
              </Box>
              <Box sx={{ flex: 1, pl: 2 }}>
                <Typography
                  sx={{ color: "#888", fontWeight: 600, fontSize: 16 }}
                >
                  Email
                </Typography>
                <Typography
                  sx={{ color: "#222", fontWeight: 700, fontSize: 17 }}
                >
                  {profile?.email || "N/A"}
                </Typography>
              </Box>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                p: 0,
                display: "flex",
                alignItems: "center",
                minHeight: 64,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#F5F7FA",
                  borderRadius: 2,
                }}
              >
                <PhoneOutlinedIcon sx={{ fontSize: 32, color: "#888" }} />
              </Box>
              <Box sx={{ flex: 1, pl: 2 }}>
                <Typography
                  sx={{ color: "#888", fontWeight: 600, fontSize: 16 }}
                >
                  Phone No.
                </Typography>
                <Typography
                  sx={{ color: "#222", fontWeight: 700, fontSize: 17 }}
                >
                  {profile?.phone || "N/A"}
                </Typography>
              </Box>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                p: 0,
                display: "flex",
                alignItems: "center",
                minHeight: 64,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#F5F7FA",
                  borderRadius: 2,
                }}
              >
                <AssignmentIndOutlinedIcon
                  sx={{ fontSize: 32, color: "#888" }}
                />
              </Box>
              <Box sx={{ flex: 1, pl: 2 }}>
                <Typography
                  sx={{ color: "#888", fontWeight: 600, fontSize: 16 }}
                >
                  Admin Id
                </Typography>
                <Typography
                  sx={{ color: "#222", fontWeight: 700, fontSize: 17 }}
                >
                  {profile?.id || "N/A"}
                </Typography>
              </Box>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                p: 0,
                display: "flex",
                alignItems: "center",
                minHeight: 64,
                cursor: "pointer",
                "&:hover": { bgcolor: "#f7f8fa" },
              }}
              onClick={handleSignOut}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#F5F7FA",
                  borderRadius: 2,
                }}
              >
                <LogoutOutlinedIcon sx={{ fontSize: 32, color: "#888" }} />
              </Box>
              <Box sx={{ flex: 1, pl: 2 }}>
                <Typography
                  sx={{ color: "#222", fontWeight: 700, fontSize: 17 }}
                >
                  Log out
                </Typography>
              </Box>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                p: 0,
                mt: 2,
                display: "flex",
                alignItems: "center",
                minHeight: 64,
                background: "none",
                boxShadow: "none",
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  borderRadius: 2,
                }}
              >
                {/* Optionally use a warning icon or similar here */}
              </Box>
              <Box
                sx={{
                  flex: 1,
                  pl: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#526794",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: 16,
                    py: 1.5,
                    height: 56,
                    boxShadow: "0 2px 8px 0 rgba(44,62,80,0.04)",
                    flex: 1,
                    "&:hover": {
                      bgcolor: "#526794",
                    },
                  }}
                  onClick={handleDeactivate}
                >
                  Deactivate Account
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#dc3545",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: 16,
                    py: 1.5,
                    height: 56,
                    boxShadow: "0 2px 8px 0 rgba(44,62,80,0.04)",
                    flex: 1,
                    "&:hover": {
                      bgcolor: "#c82333",
                    },
                  }}
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>

      {/* Edit Name Dialog */}
      <Dialog
        open={editNameDialog}
        onClose={() => setEditNameDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#222" }}>
          Edit Name
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditNameDialog(false)}
            disabled={saving}
            sx={{ color: "#666" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveName}
            variant="contained"
            disabled={saving || !newName.trim()}
            sx={{
              bgcolor: "#2950DA",
              "&:hover": { bgcolor: "#526794" },
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden file input for avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: "none" }}
      />
    </Box>
  );
};

export default ProfilePage;
