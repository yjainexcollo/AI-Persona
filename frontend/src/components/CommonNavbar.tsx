/**
 * CommonNavbar Component
 *
 * A reusable navigation bar component used across the application.
 * Provides consistent navigation with user menu, logout functionality,
 * and responsive design.
 *
 * Features:
 * - Brand logo/title with navigation
 * - User avatar and dropdown menu
 * - Settings and profile navigation
 * - Logout functionality
 * - Responsive design
 */

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { getAvatarUrl } from "../services/avatarService";

/**
 * Props interface for the CommonNavbar component
 */
interface CommonNavbarProps {
  /** Optional title/logo text to display */
  title?: string;
  /** User information for avatar and menu */
  user?: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  /** Optional callback for logout functionality */
  onSignOut?: () => void;
  /** Optional callback to toggle a left Drawer/sidebar on small screens */
  onToggleSidebar?: () => void;
}

/**
 * CommonNavbar Component
 *
 * Renders a consistent navigation bar with user menu and logout functionality.
 * Can be customized with different titles and user information.
 */
const CommonNavbar: React.FC<CommonNavbarProps> = ({
  title = "AI Persona",
  user,
  onSignOut,
  onToggleSidebar,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = !!anchorEl;

  /**
   * Handle opening the user menu
   */
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handle closing the user menu
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handle navigation to different pages
   */
  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  /**
   * Handle user logout
   * Uses custom logout handler if provided, otherwise uses centralized logout service
   */
  const handleLogout = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      logout();
    }
  };

  return (
    <AppBar
      position="static"
      component="nav"
      aria-label="Global"
      sx={{
        backgroundColor: "#fff",
        color: "#333",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left side - Logo and Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Hamburger shown on small screens to toggle sidebar */}
          {onToggleSidebar && (
            <IconButton
              onClick={onToggleSidebar}
              sx={{
                display: { xs: "inline-flex", md: "none" },
                color: "#2950DA",
              }}
              aria-label="Open sidebar"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              color: "#2950DA",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            {title}
          </Typography>
        </Box>

        {/* Right side - User Menu */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={handleMenuOpen}
            aria-label="Open user menu"
            aria-controls={isMenuOpen ? "user-menu" : undefined}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen ? "true" : undefined}
            sx={{
              color: "#333",
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
          >
            <Avatar
              src={getAvatarUrl(user?.avatarUrl)}
              alt={user?.name || "User"}
              sx={{ width: 40, height: 40 }}
            >
              <AccountIcon />
            </Avatar>
          </IconButton>

          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
            MenuListProps={{ role: "menu", "aria-labelledby": "user-menu" }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                borderRadius: 2,
              },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user?.name || "User"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                {user?.role || "Member"}
              </Typography>
            </Box>

            <Divider />

            <MenuItem
              onClick={() => handleNavigation("/profile")}
              role="menuitem"
            >
              <AccountIcon sx={{ mr: 2, fontSize: 20 }} />
              Profile
            </MenuItem>

            <MenuItem
              onClick={() => handleNavigation("/settings")}
              role="menuitem"
            >
              <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
              Settings
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={handleLogout}
              sx={{ color: "#d32f2f" }}
              role="menuitem"
            >
              <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CommonNavbar;
