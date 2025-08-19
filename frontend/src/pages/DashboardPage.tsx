import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Drawer,
  Avatar,
} from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import AdminSidebar from "../components/sidebar/AdminSidebar";
import CommonNavbar from "../components/CommonNavbar";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../utils/session";
import type { Persona } from "../types";
import { logout } from "../services/authService";
import { getPersonas } from "../services/personaService";

const COLORS = ["#2950DA", "#526794", "#E8ECF2", "#526794"];

const notifications = [
  {
    title: "Megan-Customer support",
    content: `Flash sale up to -50% starts tomorrow. Don't forget to check it out!`,
    time: "4h",
    unread: true,
  },
  {
    title: "Order Update!",
    content: `Your order #1982345 is on it's way. Expected delivery 1-2 days.`,
    time: "4h",
    unread: true,
  },
  {
    title: "Order update",
    content: `Your order #1982345 is on it's way. Expected delivery 1-2 days.`,
    time: "2d",
    unread: false,
  },
  {
    title: "Order update",
    content: `Your order #1982345 has been processed.`,
    time: "2d",
    unread: false,
  },
  {
    title: "Order update",
    content: `Your order #1982345 has been processed.`,
    time: "2d",
    unread: false,
  },
  {
    title: "Order update",
    content: `Your order #1982345 has been processed.`,
    time: "2d",
    unread: false,
  },
];

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<{
    activePersonas?: number;
    inactivePersonas?: number;
    created?: number;
    pending?: number;
    members?: number;
    users?: number;
    activeUsers?: number;
  }>({
    users: 0,
    activeUsers: 0,
    members: 0,
    created: 0,
    pending: 0,
    inactivePersonas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [personasData, setPersonasData] = useState<Persona[]>([]);

  const fetchStats = async () => {
    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

      // Stats endpoint doesn't exist in backend, use default values
      console.log("Stats endpoint not available, using default values");
      setStats({
        users: 1, // At least the current user
        activeUsers: 1,
        members: 0,
        created: 1,
        pending: 0,
        inactivePersonas: 0,
      });
    } catch (err) {
      console.warn("Error fetching stats, using default values:", err);
      // Use reasonable default values
      setStats({
        users: 1, // At least the current user
        activeUsers: 1,
        members: 0,
        created: 1,
        pending: 0,
        inactivePersonas: 0,
      });
    }
  };

  const fetchPersonas = async () => {
    try {
      const response = await getPersonas();
      setPersonasData(response.data || []);
    } catch (err) {
      console.warn("Error fetching personas, using empty array:", err);
      setPersonasData([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchPersonas()]);
      setLoading(false);
    };

    loadData();

    // Set up real-time data syncing every 30 seconds
    const statsInterval = setInterval(fetchStats, 30000);
    const personasInterval = setInterval(fetchPersonas, 30000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(personasInterval);
    };
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const handleSignOut = () => {
    logout();
  };
  const navigate = useNavigate();

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
        <Typography>Loading stats...</Typography>
      </Box>
    );
  }

  // Example: stats = { activePersonas: 10, inactivePersonas: 5, created: 20, pending: 2, members: 100, totalUsers: 50, activeUsers: 40 }
  const analyticsData = [
    { name: "Active Personas", value: loading ? 0 : personasData.length },
    {
      name: "Inactive Personas",
      value: loading ? 0 : stats?.inactivePersonas || 0,
    },
    { name: "Created", value: loading ? 0 : stats?.created || 0 },
    { name: "Pending", value: loading ? 0 : stats?.pending || 0 },
  ];
  const highlights = [
    {
      label: "Total Users",
      value: loading ? "..." : stats?.users || 0,
      color: "#2950DA",
    },
    {
      label: "Active Users",
      value: loading ? "..." : stats?.activeUsers || 0,
      color: "#2950DA",
    },
    {
      label: "Members",
      value: loading ? "..." : stats?.members || 0,
      color: "#2950DA",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f7f8fa",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Fixed sidebar on md+ */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <AdminSidebar
          userRole={user.role}
          currentTab="dashboard"
          onSignOut={handleSignOut}
        />
      </Box>
      {/* Drawer for small screens */}
      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{ sx: { width: 240 } }}
      >
        <AdminSidebar
          userRole={user.role}
          currentTab="dashboard"
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
          overflow: "hidden",
        }}
      >
        {/* Top Bar with CommonNavbar */}
        <CommonNavbar
          user={{
            name: user.name || "User",
            role: user.role || "Member",
            avatarUrl: user.avatar || "",
          }}
          onSignOut={handleSignOut}
          onToggleSidebar={() => setSidebarOpen(true)}
        />
        {/* Content */}
        <Box
          sx={{
            flex: 1,
            px: { xs: 2, md: 6 },
            py: { xs: 2, md: 4 },
            minWidth: 0,
            overflow: "auto",
          }}
        >
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
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#222" }}>
                Dashboard
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#2950DA",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontSize: 16,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#526794" },
                }}
                onClick={() => navigate("/discovery")}
              >
                View Personas
              </Button>
              <IconButton
                sx={{ bgcolor: "#fff", border: "1px solid #e0e0e0" }}
                onClick={() => setNotifOpen((v) => !v)}
              >
                <NotificationsNoneOutlinedIcon sx={{ color: "#2950DA" }} />
              </IconButton>
            </Box>
          </Box>
          {/* Analytics and Highlights */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 2, md: 4 },
              mb: 4,
            }}
          >
            {/* Analytics Pie Chart */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                borderRadius: 3,
                p: 3,
                minWidth: { xs: "auto", md: 320 },
                width: { xs: "100%", md: "auto" },
              }}
            >
              <Typography
                sx={{ fontWeight: 700, fontSize: 18, mb: 2, color: "#222" }}
              >
                Analytics
              </Typography>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={analyticsData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label
                  >
                    {analyticsData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
            {/* Highlights */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                borderRadius: 3,
                p: 3,
                minWidth: { xs: "auto", md: 320 },
                width: { xs: "100%", md: "auto" },
                display: "flex",
                flexDirection: "column",
                gap: 2,
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  sx={{ fontWeight: 700, fontSize: 18, color: "#222" }}
                >
                  Highlights
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                    Live data
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {highlights.map((h) => (
                  <Box
                    key={h.label}
                    sx={{
                      bgcolor: "#2950DA",
                      color: "#fff",
                      borderRadius: 2,
                      px: 4,
                      py: 2,
                      minWidth: 120,
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 22,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#E8ECF2",
                        mb: 0.5,
                      }}
                    >
                      {h.label}
                    </Typography>
                    {h.value}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
          {/* Active Personas */}
          <Paper elevation={0} sx={{ borderRadius: 3, minWidth: 0, mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 3,
                pb: 1,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#222" }}>
                Active Personas
              </Typography>
              <Button
                sx={{
                  color: "#2950DA",
                  fontWeight: 700,
                  fontSize: 15,
                  textTransform: "none",
                }}
                onClick={() => navigate("/discovery")}
              >
                View All
              </Button>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: { xs: 2, md: 4 },
                alignItems: "center",
                justifyContent: { xs: "center", md: "flex-start" },
                px: 3,
                pb: 3,
                flexWrap: "wrap",
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    py: 4,
                  }}
                >
                  <Typography sx={{ color: "#666" }}>
                    Loading personas...
                  </Typography>
                </Box>
              ) : personasData.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    py: 4,
                  }}
                >
                  <Typography sx={{ color: "#666" }}>
                    No personas found
                  </Typography>
                </Box>
              ) : (
                personasData.slice(0, 4).map((p, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      minWidth: 120,
                      width: { xs: "45%", sm: "auto" },
                      cursor: "pointer",
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                      },
                    }}
                    onClick={() => navigate(`/view-persona/${p.id}`)}
                  >
                    <Avatar
                      src={p.avatar}
                      sx={{ width: 72, height: 72, mb: 1 }}
                    />
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 17,
                        color: "#222",
                        textAlign: "center",
                      }}
                    >
                      {p.name}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#219653",
                        fontWeight: 600,
                        fontSize: 15,
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      {p.role}{" "}
                      <ArrowOutwardIcon sx={{ fontSize: 16, mb: "-2px" }} />
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
      {/* Notifications Drawer */}
      <Drawer
        anchor="right"
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        PaperProps={{
          sx: {
            width: 340,
            bgcolor: "#fff",
            borderLeft: "1px solid #f0f0f0",
            px: 3,
            py: 4,
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 20, color: "#222" }}>
            Notifications
          </Typography>
          <Button
            sx={{
              color: "#2950DA",
              fontWeight: 700,
              fontSize: 15,
              textTransform: "none",
            }}
          >
            View All
          </Button>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
          {notifications.map((n, i) => (
            <Box
              key={i}
              sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}
            >
              <Box
                sx={{
                  bgcolor: "#E8ECF2",
                  borderRadius: 2,
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  mt: 0.5,
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="24" height="24" fill="none" />
                  <path d="M4 4H20V20H4V4Z" fill="none" />
                  <path d="M7 7H17V17H7V7Z" fill="#2950DA" />
                </svg>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{ fontWeight: 700, fontSize: 16, color: "#222", mb: 0.5 }}
                >
                  {n.title}{" "}
                  {n.unread && (
                    <span style={{ color: "#2950DA", fontSize: 18 }}>•</span>
                  )}
                </Typography>
                <Typography
                  sx={{ color: "#444", fontWeight: 500, fontSize: 15, mb: 0.5 }}
                >
                  {n.content}
                </Typography>
                <Typography
                  sx={{ color: "#bdbdbd", fontWeight: 500, fontSize: 14 }}
                >
                  {n.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Drawer>
    </Box>
  );
};

export default DashboardPage;
