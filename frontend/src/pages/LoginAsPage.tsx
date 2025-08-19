import React from "react";
import { Box, Typography, Button } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

const LoginAsPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #f0f0f0" }}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: "#111" }}>
          CRUDO.AI
        </Typography>
      </Box>
      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, mb: 6, mt: 2, color: "#181f2a" }}
        >
          Login As
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Admin */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <PersonIcon sx={{ fontSize: 120, mb: 2, color: "#111" }} />
            <Button
              variant="contained"
              sx={{
                bgcolor: "#2950DA",
                color: "#fff",
                fontWeight: 700,
                borderRadius: 2,
                px: 4,
                py: 1,
                fontSize: 18,
                textTransform: "none",
                "&:hover": { bgcolor: "#526794" },
              }}
            >
              Admin
            </Button>
          </Box>
          {/* User */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <PersonIcon sx={{ fontSize: 120, mb: 2, color: "#111" }} />
            <Button
              variant="contained"
              sx={{
                bgcolor: "#2950DA",
                color: "#fff",
                fontWeight: 700,
                borderRadius: 2,
                px: 4,
                py: 1,
                fontSize: 18,
                textTransform: "none",
                "&:hover": { bgcolor: "#526794" },
              }}
            >
              User
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginAsPage;
