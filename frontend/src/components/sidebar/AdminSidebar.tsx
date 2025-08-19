import React from "react";
import { Box, Button, Typography } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useNavigate } from "react-router-dom";

interface AdminSidebarProps {
  userRole?: string;
  currentTab?: string;
  onSignOut?: () => void;
  /** When true, renders styles suitable for inside a Drawer (not fixed) */
  isDrawer?: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  userRole = "MEMBER",
  currentTab,
  onSignOut,
  isDrawer = false,
}) => {
  const navigate = useNavigate();
  const activeColor = "#2950DA";
  const defaultColor = "#222";
  return (
    <Box
      sx={{
        width: 220,
        minWidth: 220,
        maxWidth: 220,
        bgcolor: "#fff",
        borderRight: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        py: 3,
        position: isDrawer ? "relative" : { xs: "relative", md: "fixed" },
        left: isDrawer ? "auto" : { xs: "auto", md: 0 },
        top: isDrawer ? "auto" : { xs: "auto", md: 0 },
        height: isDrawer ? "100%" : { xs: "auto", md: "100vh" },
        zIndex: 1200,
      }}
    >
      <Box>
        {/* App Name */}
        <Typography
          sx={{ fontWeight: 800, fontSize: 22, color: "#134e3a", px: 3, mb: 3 }}
        >
          crudo.ai
        </Typography>
        <Box
          sx={{
            px: 3,
            mt: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          <Button
            startIcon={
              <BusinessCenterIcon
                sx={{
                  fontSize: 22,
                  color:
                    currentTab === "workspace" ? activeColor : defaultColor,
                }}
              />
            }
            sx={{
              color: currentTab === "workspace" ? activeColor : defaultColor,
              fontWeight: 500,
              fontSize: 16,
              textTransform: "none",
              width: "100%",
              justifyContent: "flex-start",
              textAlign: "left",
            }}
            fullWidth
            onClick={() => navigate("/")}
          >
            Workspace
          </Button>
          {userRole === "ADMIN" && (
            <Button
              startIcon={
                <HomeOutlinedIcon
                  sx={{
                    fontSize: 22,
                    color:
                      currentTab === "dashboard" ? activeColor : defaultColor,
                  }}
                />
              }
              sx={{
                color: currentTab === "dashboard" ? activeColor : defaultColor,
                fontWeight: 500,
                fontSize: 16,
                textTransform: "none",
                width: "100%",
                justifyContent: "flex-start",
                textAlign: "left",
              }}
              fullWidth
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
          )}
          <Button
            startIcon={
              <SettingsIcon
                sx={{
                  fontSize: 22,
                  color: currentTab === "settings" ? activeColor : defaultColor,
                }}
              />
            }
            sx={{
              color: currentTab === "settings" ? activeColor : defaultColor,
              fontWeight: 500,
              fontSize: 16,
              textTransform: "none",
              width: "100%",
              justifyContent: "flex-start",
              textAlign: "left",
            }}
            fullWidth
            onClick={() => navigate("/settings")}
          >
            Settings
          </Button>
          {userRole === "ADMIN" && (
            <Button
              startIcon={
                <AdminPanelSettingsIcon
                  sx={{
                    fontSize: 22,
                    color:
                      currentTab === "workspace-settings"
                        ? activeColor
                        : defaultColor,
                  }}
                />
              }
              sx={{
                color:
                  currentTab === "workspace-settings"
                    ? activeColor
                    : defaultColor,
                fontWeight: 500,
                fontSize: 16,
                textTransform: "none",
                width: "100%",
                justifyContent: "flex-start",
                textAlign: "left",
              }}
              fullWidth
              onClick={() => navigate("/workspace-settings")}
            >
              Workspace Settings
            </Button>
          )}
          {userRole === "ADMIN" && (
            <>
              <Button
                startIcon={
                  <span
                    role="img"
                    aria-label="users"
                    style={{
                      color:
                        currentTab === "users" ? activeColor : defaultColor,
                      fontSize: 22,
                    }}
                  >
                    👤
                  </span>
                }
                sx={{
                  color: currentTab === "users" ? activeColor : defaultColor,
                  fontWeight: 500,
                  fontSize: 16,
                  textTransform: "none",
                  width: "100%",
                  justifyContent: "flex-start",
                  textAlign: "left",
                }}
                fullWidth
                onClick={() => navigate("/active-users")}
              >
                Users
              </Button>
              <Button
                startIcon={
                  <span
                    role="img"
                    aria-label="admins"
                    style={{
                      color:
                        currentTab === "admins" ? activeColor : defaultColor,
                      fontSize: 22,
                    }}
                  >
                    👤
                  </span>
                }
                sx={{
                  color: currentTab === "admins" ? activeColor : defaultColor,
                  fontWeight: 500,
                  fontSize: 16,
                  textTransform: "none",
                  width: "100%",
                  justifyContent: "flex-start",
                  textAlign: "left",
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
      <Box sx={{ px: 3, pb: 2 }}>
        <Button
          startIcon={<span style={{ transform: "rotate(180deg)" }}>↩️</span>}
          sx={{
            color: "#6b7280",
            fontWeight: 500,
            fontSize: 16,
            textTransform: "none",
          }}
          fullWidth
          onClick={onSignOut}
        >
          Sign out
        </Button>
      </Box>
    </Box>
  );
};

export default AdminSidebar;
