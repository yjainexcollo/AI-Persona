import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Switch,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Drawer,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PolicyIcon from "@mui/icons-material/Policy";
import CommonNavbar from "../components/CommonNavbar";
import AdminSidebar from "../components/sidebar/AdminSidebar";
import { fetchWithAuth } from "../utils/session";
import { logout } from "../services/authService";

const settingsSidebar = [
  {
    key: "account",
    icon: <AccountCircleIcon sx={{ fontSize: 28 }} />,
    title: "Account",
    subtitle:
      "Settings related to your personal information and account credentials",
  },
  {
    key: "notifications",
    icon: <NotificationsNoneIcon sx={{ fontSize: 28 }} />,
    title: "Notifications",
    subtitle: "All settings related to notifications",
  },
  {
    key: "privacy",
    icon: <PolicyIcon sx={{ fontSize: 28 }} />,
    title: "Privacy policy",
    subtitle: "All settings related to notifications",
  },
];

const notificationOptions = [
  { label: "Pause notification", key: "pause" },
  { label: "In app", key: "inapp" },
  { label: "Email", key: "email" },
  { label: "SMS", key: "sms" },
  { label: "WhatsApp", key: "whatsapp" },
];

const SettingsPage: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [activeSection, setActiveSection] = useState<
    "account" | "notifications" | "privacy"
  >("account");
  const [toggles, setToggles] = useState({
    pause: false,
    inapp: true,
    email: true,
    sms: true,
    whatsapp: true,
  });
  const [profile, setProfile] = useState<{
    name?: string;
    email?: string;
    address?: string;
    phone?: string;
    governmentId?: string;
    theme?: string;
  } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [editField, setEditField] = useState<
    null | "name" | "email" | "address" | "phone" | "governmentId"
  >(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (activeSection !== "account") return;
    setLoadingProfile(true);
    setProfileError("");
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    fetchWithAuth(`${backendUrl}/api/users/me`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data.data.user);
      })
      .catch(() => setProfileError("Failed to load profile"))
      .finally(() => setLoadingProfile(false));
  }, [activeSection]);

  const handleEditClick = (
    field: "name" | "email" | "address" | "phone" | "governmentId",
    currentValue: string
  ) => {
    setEditField(field);
    setEditValue(currentValue || "");
  };

  const handleEditSave = async () => {
    if (!editField) return;
    setSaving(true);
    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const res = await fetchWithAuth(`${backendUrl}/api/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [editField]: editValue }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setEditField(null);
      setEditValue("");
      // Refresh profile
      setLoadingProfile(true);
      setProfileError("");
      const profileRes = await fetchWithAuth(`${backendUrl}/api/users/me`);
      const data = await profileRes.json();
      setProfile(data.data.user);
    } catch {
      // Optionally show error
    } finally {
      setSaving(false);
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate passwords
    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      setChangePasswordError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setChangePasswordError("New password must be at least 8 characters long");
      return;
    }

    // Password strength validation (same as backend)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      setChangePasswordError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      );
      return;
    }

    setChangePasswordLoading(true);
    setChangePasswordError("");
    setChangePasswordSuccess("");

    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const res = await fetchWithAuth(`${backendUrl}/api/users/me/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to change password");
      }

      setChangePasswordSuccess("Password changed successfully!");

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Close dialog after 2 seconds
      setTimeout(() => {
        setChangePasswordDialogOpen(false);
        setChangePasswordSuccess("");
      }, 2000);
    } catch (err) {
      setChangePasswordError(
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setChangePasswordLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <AdminSidebar
          userRole={user.role}
          currentTab="settings"
          onSignOut={logout}
        />
      </Box>
      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{ sx: { width: 240 } }}
      >
        <AdminSidebar
          userRole={user.role}
          currentTab="settings"
          onSignOut={logout}
          isDrawer
        />
      </Drawer>
      <Box
        sx={{
          flex: 1,
          ml: { xs: 0, md: "220px" },
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "#f8f9fa",
        }}
      >
        {/* Top Bar with CommonNavbar */}
        <CommonNavbar
          user={{
            name: user.name || "User",
            role: user.role || "Member",
            avatarUrl: user.avatar || "",
          }}
          onSignOut={logout}
          onToggleSidebar={() => setSidebarOpen(true)}
        />
        {/* Settings Sidebar */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            minHeight: "calc(100vh - 64px)",
            bgcolor: "#f8f9fa",
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", md: 320 },
              bgcolor: "#fff",
              borderRight: { xs: "none", md: "1px solid #e0e0e0" },
              py: 4,
              px: 0,
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              minHeight: "100%",
            }}
          >
            {settingsSidebar.map((item) => (
              <Box
                key={item.key}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  px: 4,
                  py: 2.5,
                  cursor: "pointer",
                  bgcolor:
                    activeSection === item.key ? "#E8ECF2" : "transparent",
                  borderRight:
                    activeSection === item.key
                      ? "4px solid #2950DA"
                      : "4px solid transparent",
                  mb: 0.5,
                  borderRadius: 0,
                  transition: "background 0.2s",
                  minHeight: 72,
                }}
                onClick={() =>
                  setActiveSection(
                    item.key as "account" | "notifications" | "privacy"
                  )
                }
              >
                <Box
                  sx={{
                    color: activeSection === item.key ? "#2950DA" : "#222",
                    mt: 0.5,
                  }}
                >
                  {item.icon}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 19,
                      color: activeSection === item.key ? "#2950DA" : "#222",
                      mb: 0.2,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{ color: "#6b7280", fontWeight: 400, fontSize: 14 }}
                  >
                    {item.subtitle}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          {/* Main Content */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 2, md: 6 },
              bgcolor: "#f7f8fa",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              minHeight: "100vh",
            }}
          >
            {activeSection === "notifications" && (
              <>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "#222",
                    mb: 4,
                    alignSelf: "flex-start",
                  }}
                >
                  Notifications
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    width: { xs: "100%", sm: 500 },
                    borderRadius: 4,
                    p: 4,
                    bgcolor: "#fff",
                    boxShadow: "0 2px 8px 0 rgba(44,62,80,0.04)",
                  }}
                >
                  {notificationOptions.map((opt, idx) => (
                    <Box
                      key={opt.key}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: idx === notificationOptions.length - 1 ? 0 : 2,
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 500, fontSize: 18, color: "#222" }}
                      >
                        {opt.label}
                      </Typography>
                      <Switch
                        checked={toggles[opt.key as keyof typeof toggles]}
                        onChange={() =>
                          setToggles((t) => ({
                            ...t,
                            [opt.key]: !t[opt.key as keyof typeof toggles],
                          }))
                        }
                        color="success"
                      />
                    </Box>
                  ))}
                </Paper>
              </>
            )}
            {activeSection === "account" && (
              <>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "#222",
                    mb: 4,
                    alignSelf: "flex-start",
                  }}
                >
                  Account
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    width: { xs: "100%", sm: 500 },
                    borderRadius: 4,
                    p: 4,
                    bgcolor: "#fff",
                    boxShadow: "0 2px 8px 0 rgba(44,62,80,0.04)",
                  }}
                >
                  {loadingProfile ? (
                    <Typography>Loading...</Typography>
                  ) : profileError ? (
                    <Typography color="error">{profileError}</Typography>
                  ) : (
                    <>
                      {/* Legal name */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 3,
                        }}
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: 16,
                              color: "#222",
                            }}
                          >
                            Legal name
                          </Typography>
                          <Typography
                            sx={{
                              color: "#888",
                              fontWeight: 400,
                              fontSize: 15,
                            }}
                          >
                            {profile?.name || "N/A"}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            color: "#2950DA",
                            fontWeight: 700,
                            fontSize: 15,
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            handleEditClick("name", profile?.name || "")
                          }
                        >
                          Edit
                        </Typography>
                      </Box>
                      {/* Email address */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 3,
                        }}
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: 16,
                              color: "#222",
                            }}
                          >
                            Email address
                          </Typography>
                          <Typography
                            sx={{
                              color: "#888",
                              fontWeight: 400,
                              fontSize: 15,
                            }}
                          >
                            {profile?.email || "N/A"}
                          </Typography>
                        </Box>
                        {/* No Edit button for email */}
                      </Box>
                      {/* Change Password Button */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mt: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: 16,
                              color: "#222",
                            }}
                          >
                            Password
                          </Typography>
                          <Typography
                            sx={{
                              color: "#888",
                              fontWeight: 400,
                              fontSize: 15,
                            }}
                          >
                            ••••••••
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            setChangePasswordDialogOpen(true);
                            setChangePasswordError("");
                            setChangePasswordSuccess("");
                            setCurrentPassword("");
                            setNewPassword("");
                            setConfirmPassword("");
                          }}
                        >
                          Change Password
                        </Button>
                      </Box>
                    </>
                  )}
                </Paper>
                {/* Edit Dialog */}
                <Dialog open={!!editField} onClose={() => setEditField(null)}>
                  <DialogTitle>
                    Edit{" "}
                    {editField === "name"
                      ? "Legal name"
                      : editField === "email"
                      ? "Email address"
                      : editField === "address"
                      ? "Address"
                      : editField === "phone"
                      ? "Phone number"
                      : "Government ID"}
                  </DialogTitle>
                  <DialogContent>
                    <TextField
                      autoFocus
                      margin="dense"
                      label={
                        editField === "name"
                          ? "Legal name"
                          : editField === "email"
                          ? "Email address"
                          : editField === "address"
                          ? "Address"
                          : editField === "phone"
                          ? "Phone number"
                          : "Government ID"
                      }
                      type="text"
                      fullWidth
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => setEditField(null)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleEditSave}
                      variant="contained"
                      color="primary"
                      disabled={saving || !editValue.trim()}
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </DialogActions>
                </Dialog>
              </>
            )}
            {activeSection === "privacy" && (
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#222", mb: 2 }}
              >
                Privacy Policy
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      {/* Change Password Dialog */}
      <Dialog
        open={changePasswordDialogOpen}
        onClose={() => setChangePasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {changePasswordSuccess ? (
            <Typography color="success.main" sx={{ mb: 2 }}>
              {changePasswordSuccess}
            </Typography>
          ) : null}
          {changePasswordError ? (
            <Typography color="error.main" sx={{ mb: 2 }}>
              {changePasswordError}
            </Typography>
          ) : null}

          {/* Password Requirements */}
          <Box
            sx={{
              bgcolor: "#f8f9fa",
              p: 2,
              borderRadius: 1,
              mb: 2,
              border: "1px solid #e9ecef",
            }}
          >
            <Typography
              sx={{ fontWeight: 600, fontSize: 14, color: "#495057", mb: 1 }}
            >
              Password Requirements:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography sx={{ fontSize: 13, color: "#6c757d" }}>
                • Minimum 8 characters
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#6c757d" }}>
                • At least 1 uppercase letter (A-Z)
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#6c757d" }}>
                • At least 1 lowercase letter (a-z)
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#6c757d" }}>
                • At least 1 number (0-9)
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#6c757d" }}>
                • At least 1 special character (@$!%*?&)
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={changePasswordLoading}
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={changePasswordLoading}
              helperText="Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={changePasswordLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setChangePasswordDialogOpen(false)}
            disabled={changePasswordLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={
              changePasswordLoading ||
              !currentPassword.trim() ||
              !newPassword.trim() ||
              !confirmPassword.trim()
            }
            onClick={handleChangePassword}
          >
            {changePasswordLoading ? "Changing Password..." : "Change Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
