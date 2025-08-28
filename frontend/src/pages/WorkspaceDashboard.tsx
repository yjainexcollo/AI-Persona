import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, Avatar, Drawer } from "@mui/material";
import AdminSidebar from "../components/sidebar/AdminSidebar";
import { fetchWithAuth } from "../utils/session";
import {
  getWorkspaceDetails,
  getWorkspaceMembers,
} from "../services/workspaceService";
import { getAvatarUrl } from "../services/avatarService";
import { env } from "../lib/config/env";

interface WorkspaceDashboardProps {
  workspaceId: string;
  workspaceName: string;
  user: { name: string; role: string; avatarUrl: string };
  stats: { members: string; users: string };
  onUsePersona: () => void;
  onSignOut: () => void;
}

const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({
  workspaceId,
  workspaceName,
  user,
  stats,
  onUsePersona,
  onSignOut,
}) => {
  const [dynamicStats, setDynamicStats] = useState({
    members: stats?.members ?? "0",
    users: stats?.users ?? "0",
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [dynamicWorkspaceName, setDynamicWorkspaceName] =
    useState(workspaceName);
  const [dynamicUser, setDynamicUser] = useState(user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Clear test data on component mount
  useEffect(() => {
    const storedWorkspaceName = localStorage.getItem("workspaceName");
    if (storedWorkspaceName && storedWorkspaceName.includes("Test Workspace")) {
      localStorage.removeItem("workspaceName");
      console.log("Cleared test workspace name from localStorage on mount");
    }

    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        if (userData.name && userData.name.includes("Test User")) {
          localStorage.removeItem("user");
          console.log("Cleared test user data from localStorage on mount");
        }
      } catch (error) {
        console.warn("Error parsing user data from localStorage:", error);
      }
    }

    setDynamicWorkspaceName(workspaceName);
    console.log("Set workspace name to original prop value:", workspaceName);
  }, [workspaceName]);

  const fetchWorkspaceStats = async () => {
    setLoadingStats(true);
    try {
      const ws = await getWorkspaceDetails();
      const [allRes, membersRes] = await Promise.all([
        getWorkspaceMembers(ws.id, { page: 1, limit: 1 }),
        getWorkspaceMembers(ws.id, { role: "MEMBER", page: 1, limit: 1 }),
      ]);

      const users = (
        allRes.pagination?.total ??
        allRes.data?.length ??
        0
      ).toString();
      const members = (membersRes.pagination?.total ?? 0).toString();

      setDynamicStats({ users, members });
    } catch (error) {
      console.warn("Error fetching workspace stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    const updateWorkspaceName = () => {
      const storedWorkspaceName = localStorage.getItem("workspaceName");
      if (
        storedWorkspaceName &&
        storedWorkspaceName.includes("Test Workspace")
      ) {
        localStorage.removeItem("workspaceName");
        console.log("Cleared test workspace name from localStorage");
      }
      setDynamicWorkspaceName(workspaceName);
    };

    const updateUserData = () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const currentUser = {
          name: userData.name || user.name || "Demo User",
          role: userData.role || user.role || "Member",
          avatarUrl: userData.avatar || user.avatarUrl || "",
        };
        setDynamicUser(currentUser);
      } catch (error) {
        console.warn("Error parsing user data from localStorage:", error);
      }
    };

    const fetchUserData = async () => {
      try {
        const BACKEND_URL = env.BACKEND_URL;
        const res = await fetchWithAuth(`${BACKEND_URL}/api/users/me`);

        if (res.ok) {
          const data = await res.json();
          if (data.status === "success" && data.data && data.data.user) {
            const apiUser = data.data.user;
            const currentUser = {
              name: apiUser.name || user.name || "Demo User",
              role: apiUser.role || user.role || "Member",
              avatarUrl: apiUser.avatarUrl || user.avatarUrl || "",
            };
            setDynamicUser(currentUser);

            const updatedUserData = {
              ...JSON.parse(localStorage.getItem("user") || "{}"),
              name: apiUser.name,
              role: apiUser.role,
              avatarUrl: apiUser.avatarUrl,
            };
            localStorage.setItem("user", JSON.stringify(updatedUserData));
          }
        }
      } catch (error) {
        console.warn("Error fetching user data from API:", error);
      }
    };

    if (workspaceId && workspaceId !== "demo-workspace") {
      fetchWorkspaceStats();
      updateWorkspaceName();
      updateUserData();
      fetchUserData();

      const statsInterval = setInterval(fetchWorkspaceStats, 10000);
      const nameInterval = setInterval(updateWorkspaceName, 15000);
      const userInterval = setInterval(updateUserData, 15000);
      const userDataInterval = setInterval(fetchUserData, 30000);

      return () => {
        clearInterval(statsInterval);
        clearInterval(nameInterval);
        clearInterval(userInterval);
        clearInterval(userDataInterval);
      };
    }
  }, [workspaceId, workspaceName, user]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <AdminSidebar
          userRole={dynamicUser.role}
          currentTab="workspace"
          onSignOut={onSignOut}
          userName={dynamicUser.name}
          avatarUrl={getAvatarUrl(dynamicUser.avatarUrl)}
        />
      </Box>
      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{ sx: { width: 240 } }}
      >
        <AdminSidebar
          userRole={dynamicUser.role}
          currentTab="workspace"
          onSignOut={onSignOut}
          isDrawer
          userName={dynamicUser.name}
          avatarUrl={getAvatarUrl(dynamicUser.avatarUrl)}
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
        {/* Welcome Section */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, color: "#111", textAlign: "center" }}
            >
              {`Welcome to ${dynamicWorkspaceName}`}
            </Typography>
          </Box>
          <Typography
            sx={{
              color: "#6b7280",
              fontWeight: 500,
              fontSize: 18,
              mb: 4,
              textAlign: "center",
            }}
          >
            Bring your team in and start deploying AI personas.
          </Typography>
          <Avatar
            src={getAvatarUrl(dynamicUser.avatarUrl)}
            alt={dynamicUser.name}
            sx={{ width: 80, height: 80, mb: 1.5 }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 20, color: "#222" }}>
              {dynamicUser.name}
            </Typography>
          </Box>
          <Typography
            sx={{ color: "#6b7280", fontWeight: 500, fontSize: 16, mb: 3 }}
          >
            {dynamicUser.role}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 5 }}>
            <Button
              variant="outlined"
              sx={{
                color: "#222",
                fontWeight: 700,
                px: 4,
                textTransform: "none",
                borderRadius: 2,
                bgcolor: "#F5F7FA",
                borderColor: "#e0e0e0",
              }}
              onClick={onUsePersona}
            >
              Use Persona
            </Button>
          </Box>
          {/* Quick Stats */}
          <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
            <Paper
              sx={{
                p: 3,
                minWidth: 180,
                borderRadius: 3,
                bgcolor: "#F5F7FA",
                position: "relative",
              }}
            >
              <Typography
                sx={{ color: "#6b7280", fontWeight: 500, fontSize: 15, mb: 1 }}
              >
                Members
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 24, color: "#111" }}>
                {loadingStats ? "..." : dynamicStats.members}
              </Typography>
              <Typography
                sx={{
                  color: "#9ca3af",
                  fontWeight: 400,
                  fontSize: 12,
                  mt: 0.5,
                }}
              >
                MEMBER users only
              </Typography>
            </Paper>
            <Paper
              sx={{
                p: 3,
                minWidth: 180,
                borderRadius: 3,
                bgcolor: "#F5F7FA",
                position: "relative",
              }}
            >
              <Typography
                sx={{ color: "#6b7280", fontWeight: 500, fontSize: 15, mb: 1 }}
              >
                Total Users
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 24, color: "#111" }}>
                {loadingStats ? "..." : dynamicStats.users}
              </Typography>
              <Typography
                sx={{
                  color: "#9ca3af",
                  fontWeight: 400,
                  fontSize: 12,
                  mt: 0.5,
                }}
              >
                All users
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default WorkspaceDashboard;
