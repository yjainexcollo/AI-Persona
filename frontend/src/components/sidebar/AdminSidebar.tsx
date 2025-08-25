import React from "react";
import {
  Box,
  Button,
  Typography,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import GridViewIcon from "@mui/icons-material/GridView";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

interface AdminSidebarProps {
  userRole?: string;
  currentTab?: string;
  onSignOut?: () => void;
  /** When true, renders styles suitable for inside a Drawer (not fixed) */
  isDrawer?: boolean;
  /** User name for profile display */
  userName?: string;
  /** User avatar URL for profile display */
  avatarUrl?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  userRole = "MEMBER",
  currentTab,
  onSignOut,
  isDrawer = false,
  userName = "User",
  avatarUrl = "",
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const activeColor = "#2950DA";
  const defaultColor = "#222";
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = !!anchorEl;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const handleLogout = () => {
    if (onSignOut) {
      onSignOut();
    }
    handleMenuClose();
  };

  // Responsive sidebar width
  const sidebarWidth = isMobile ? 240 : 220;

  return (
    <Box
      sx={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        maxWidth: sidebarWidth,
        bgcolor: "#fff",
        borderRight: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        py: { xs: 2, md: 3 },
        px: { xs: 1, md: 0 },
        position: isDrawer ? "relative" : { xs: "relative", md: "fixed" },
        left: isDrawer ? "auto" : { xs: "auto", md: 0 },
        top: isDrawer ? "auto" : { xs: "auto", md: 0 },
        height: isDrawer ? "100%" : { xs: "auto", md: "100vh" },
        zIndex: 1200,
        transition: "width 0.3s ease, padding 0.3s ease",
      }}
    >
      <Box>
        {/* App Name */}
        <Box
          component="a"
          href="/"
          aria-label="Go to home"
          sx={{
            px: { xs: 2, md: 3 },
            mb: { xs: 2, md: 3 },
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="crudo.ai logo"
            loading="lazy"
            sx={{
              height: { xs: 10, md: 20 },
              width: "auto",
              transition: "height 0.3s ease",
              cursor: "pointer",
            }}
          />
        </Box>

        {/* Navigation Menu */}
        <Box
          sx={{
            px: { xs: 1, md: 3 },
            mt: { xs: 1, md: 2 },
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: { xs: 1, md: 2 },
          }}
        >
          {/* Workspace */}
          <Button
            startIcon={
              <WorkspacesIcon
                sx={{
                  fontSize: { xs: 20, md: 22 },
                  color:
                    currentTab === "workspace" ? activeColor : defaultColor,
                }}
              />
            }
            sx={{
              color: currentTab === "workspace" ? activeColor : defaultColor,
              fontWeight: 500,
              fontSize: { xs: 14, md: 16 },
              textTransform: "none",
              width: "100%",
              justifyContent: "flex-start",
              textAlign: "left",
              py: { xs: 1, md: 1.5 },
              px: { xs: 1.5, md: 2 },
              borderRadius: 2,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              "&:hover": {
                backgroundColor:
                  currentTab === "workspace"
                    ? "rgba(41, 80, 218, 0.08)"
                    : "#f5f5f5",
              },
            }}
            fullWidth
            onClick={() => navigate("/")}
          >
            Workspace
          </Button>

          {/* Dashboard - Admin Only */}
          {userRole === "ADMIN" && (
            <Button
              startIcon={
                <GridViewIcon
                  sx={{
                    fontSize: { xs: 20, md: 22 },
                    color:
                      currentTab === "dashboard" ? activeColor : defaultColor,
                  }}
                />
              }
              sx={{
                color: currentTab === "dashboard" ? activeColor : defaultColor,
                fontWeight: 500,
                fontSize: { xs: 14, md: 16 },
                textTransform: "none",
                width: "100%",
                justifyContent: "flex-start",
                textAlign: "left",
                py: { xs: 1, md: 1.5 },
                px: { xs: 1.5, md: 2 },
                borderRadius: 2,
                fontFamily:
                  '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                "&:hover": {
                  backgroundColor:
                    currentTab === "dashboard"
                      ? "rgba(41, 80, 218, 0.08)"
                      : "#f5f5f5",
                },
              }}
              fullWidth
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
          )}

          {/* Admin Only Sections */}
          {userRole === "ADMIN" && (
            <>
              {/* Users */}
              <Button
                startIcon={
                  <PeopleIcon
                    sx={{
                      fontSize: { xs: 20, md: 22 },
                      color:
                        currentTab === "users" ? activeColor : defaultColor,
                    }}
                  />
                }
                sx={{
                  color: currentTab === "users" ? activeColor : defaultColor,
                  fontWeight: 500,
                  fontSize: { xs: 14, md: 16 },
                  textTransform: "none",
                  width: "100%",
                  justifyContent: "flex-start",
                  textAlign: "left",
                  py: { xs: 1, md: 1.5 },
                  px: { xs: 1.5, md: 2 },
                  borderRadius: 2,
                  fontFamily:
                    '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  "&:hover": {
                    backgroundColor:
                      currentTab === "users"
                        ? "rgba(41, 80, 218, 0.08)"
                        : "#f5f5f5",
                  },
                }}
                fullWidth
                onClick={() => navigate("/active-users")}
              >
                Users
              </Button>

              {/* Admins */}
              <Button
                startIcon={
                  <SupervisorAccountIcon
                    sx={{
                      fontSize: { xs: 20, md: 22 },
                      color:
                        currentTab === "admins" ? activeColor : defaultColor,
                    }}
                  />
                }
                sx={{
                  color: currentTab === "admins" ? activeColor : defaultColor,
                  fontWeight: 500,
                  fontSize: { xs: 14, md: 16 },
                  textTransform: "none",
                  width: "100%",
                  justifyContent: "flex-start",
                  textAlign: "left",
                  py: { xs: 1, md: 1.5 },
                  px: { xs: 1.5, md: 2 },
                  borderRadius: 2,
                  fontFamily:
                    '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  "&:hover": {
                    backgroundColor:
                      currentTab === "admins"
                        ? "rgba(41, 80, 218, 0.08)"
                        : "#f5f5f5",
                  },
                }}
                fullWidth
                onClick={() => navigate("/admins")}
              >
                Admins
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Profile Section */}
      <Box sx={{ px: { xs: 1, md: 3 }, pb: { xs: 1.5, md: 2 } }}>
        <Divider sx={{ mb: { xs: 1.5, md: 2 } }} />
        <IconButton
          onClick={handleMenuOpen}
          aria-label="Open user menu"
          aria-controls={isMenuOpen ? "user-menu" : undefined}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen ? "true" : undefined}
          sx={{
            width: "100%",
            justifyContent: "flex-start",
            p: { xs: 0.5, md: 0 },
            "&:hover": { backgroundColor: "#f5f5f5" },
            borderRadius: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, md: 2 },
              width: "100%",
            }}
          >
            <Avatar
              src={avatarUrl}
              alt={userName}
              sx={{
                width: { xs: 36, md: 40 },
                height: { xs: 36, md: 40 },
                transition: "width 0.3s ease, height 0.3s ease",
              }}
            />
            <Box sx={{ overflow: "hidden", textAlign: "left" }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: 13, md: 14 },
                  color: "#222",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  maxWidth: { xs: 120, md: 140 },
                  fontFamily:
                    '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  transition: "font-size 0.3s ease",
                }}
              >
                {userName}
              </Typography>
              <Typography
                sx={{
                  color: "#6b7280",
                  fontWeight: 400,
                  fontSize: { xs: 11, md: 12 },
                  fontFamily:
                    '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  transition: "font-size 0.3s ease",
                }}
              >
                {userRole}
              </Typography>
            </Box>
          </Box>
        </IconButton>

        {/* User Menu Popup */}
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          MenuListProps={{ role: "menu", "aria-labelledby": "user-menu" }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: { xs: 180, md: 200 },
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: 2,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                fontFamily:
                  '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              }}
            >
              {userName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#666",
                fontFamily:
                  '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              }}
            >
              {userRole}
            </Typography>
          </Box>

          <Divider />

          <MenuItem
            onClick={() => handleNavigation("/profile")}
            role="menuitem"
            sx={{
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            }}
          >
            <AccountCircleIcon sx={{ mr: 2, fontSize: 20 }} />
            Profile
          </MenuItem>

          <MenuItem
            onClick={() => handleNavigation("/settings")}
            role="menuitem"
            sx={{
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            }}
          >
            <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
            Settings
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={handleLogout}
            sx={{
              color: "#d32f2f",
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            }}
            role="menuitem"
          >
            <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
            Sign Out
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default AdminSidebar;
