import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Drawer,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  NotificationsNone as NotificationsNoneIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/sidebar/AdminSidebar";
import { fetchWithAuth } from "../utils/session";

interface Notification {
  id: string;
  title: string;
  content: string;
  time: string;
  unread: boolean;
  type?: string;
  createdAt: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      // TODO: Replace with actual API call when notifications endpoint is available
      // const response = await fetchWithAuth('/api/notifications');
      // setNotifications(response.data || []);

      // For now, set empty notifications
      setNotifications([]);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setMarkingAsRead(notificationId);

      // TODO: Replace with actual API call when mark as read endpoint is available
      // await fetchWithAuth(`/api/notifications/${notificationId}/read`, { method: 'PUT' });

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, unread: false } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    } finally {
      setMarkingAsRead(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: Replace with actual API call when mark all as read endpoint is available
      // await fetchWithAuth('/api/notifications/mark-all-read', { method: 'PUT' });

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f7f8fa" }}>
      {/* Fixed sidebar on md+ */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <AdminSidebar
          userRole="MEMBER"
          currentTab="notifications"
          onSignOut={() => navigate("/login")}
        />
      </Box>

      {/* Drawer for small screens */}
      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{ sx: { width: 240 } }}
      >
        <AdminSidebar
          userRole="MEMBER"
          currentTab="notifications"
          onSignOut={() => navigate("/login")}
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
        {/* Header */}
        <Box
          sx={{
            bgcolor: "#fff",
            borderBottom: "1px solid #e0e0e0",
            p: { xs: 2, md: 3 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              maxWidth: 1200,
              mx: "auto",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {isMobile && (
                <IconButton
                  onClick={() => setSidebarOpen(true)}
                  sx={{ color: "#2950DA" }}
                >
                  <ArrowBackIcon />
                </IconButton>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <NotificationsNoneIcon
                  sx={{ color: "#2950DA", fontSize: 28 }}
                />
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#222" }}
                >
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Chip
                    label={unreadCount}
                    size="small"
                    sx={{
                      bgcolor: "#2950DA",
                      color: "#fff",
                      fontWeight: 700,
                      ml: 1,
                    }}
                  />
                )}
              </Box>
            </Box>

            {unreadCount > 0 && (
              <Button
                variant="outlined"
                onClick={markAllAsRead}
                sx={{
                  color: "#2950DA",
                  borderColor: "#2950DA",
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#2950DA",
                    bgcolor: "rgba(41, 80, 218, 0.04)",
                  },
                }}
              >
                Mark All as Read
              </Button>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            px: { xs: 2, md: 4 },
            py: { xs: 2, md: 3 },
            maxWidth: 1200,
            mx: "auto",
            width: "100%",
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {notifications.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                p: { xs: 4, md: 8 },
                textAlign: "center",
                bgcolor: "#fff",
              }}
            >
              <NotificationsNoneIcon
                sx={{ fontSize: 64, color: "#ccc", mb: 2 }}
              />
              <Typography variant="h5" sx={{ color: "#666", mb: 1 }}>
                No notifications yet
              </Typography>
              <Typography sx={{ color: "#999", fontSize: 16 }}>
                You're all caught up! We'll notify you when there's something
                new.
              </Typography>
            </Paper>
          ) : (
            <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
              <List sx={{ p: 0 }}>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        p: { xs: 2, md: 3 },
                        bgcolor: notification.unread
                          ? "rgba(41, 80, 218, 0.02)"
                          : "#fff",
                        "&:hover": {
                          bgcolor: notification.unread
                            ? "rgba(41, 80, 218, 0.04)"
                            : "#f8f9fa",
                        },
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 48 }}>
                        <Box
                          sx={{
                            bgcolor: notification.unread
                              ? "#E8ECF2"
                              : "#f5f5f5",
                            borderRadius: 2,
                            p: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 40,
                            height: 40,
                          }}
                        >
                          <NotificationsNoneIcon
                            sx={{
                              color: notification.unread ? "#2950DA" : "#999",
                              fontSize: 20,
                            }}
                          />
                        </Box>
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: notification.unread ? 700 : 600,
                                fontSize: 16,
                                color: "#222",
                              }}
                            >
                              {notification.title}
                            </Typography>
                            {notification.unread && (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor: "#2950DA",
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography
                              sx={{
                                color: "#444",
                                fontSize: 14,
                                lineHeight: 1.4,
                                mb: 1,
                              }}
                            >
                              {notification.content}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Typography
                                sx={{
                                  color: "#999",
                                  fontSize: 12,
                                  fontWeight: 500,
                                }}
                              >
                                {notification.time}
                              </Typography>
                              {notification.type && (
                                <Chip
                                  label={notification.type}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    fontSize: 11,
                                    height: 20,
                                    borderColor: "#ddd",
                                    color: "#666",
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        }
                      />

                      {notification.unread && (
                        <Button
                          size="small"
                          onClick={() => markAsRead(notification.id)}
                          disabled={markingAsRead === notification.id}
                          sx={{
                            color: "#2950DA",
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: 12,
                            minWidth: 0,
                            px: 1,
                            "&:hover": {
                              bgcolor: "rgba(41, 80, 218, 0.04)",
                            },
                          }}
                        >
                          {markingAsRead === notification.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            "Mark as read"
                          )}
                        </Button>
                      )}
                    </ListItem>
                    {index < notifications.length - 1 && (
                      <Divider sx={{ mx: 2 }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default NotificationsPage;
