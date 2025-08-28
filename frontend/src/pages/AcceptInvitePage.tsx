import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { env } from "../lib/config/env";

const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const acceptInvite = async () => {
      if (!token) {
        setError("No invitation token provided.");
        setLoading(false);
        return;
      }
      try {
        // Get userId from localStorage (if logged in)
        let userId = "";
        try {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          userId = user.id || "";
        } catch {}
        if (!userId) {
          setError("You must be logged in to accept an invite.");
          setLoading(false);
          return;
        }
        const backendUrl = env.BACKEND_URL;
        const res = await fetch(`${backendUrl}/api/invites/accept`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, userId }),
        });
        if (res.ok) {
          // Invite accepted, redirect to dashboard or home
          navigate("/dashboard");
        } else {
          setError("Invalid or expired invitation link.");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    acceptInvite();
    // eslint-disable-next-line
  }, [token]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Validating invitation...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => navigate("/login")}>
          Go to Login
        </Button>
      </Box>
    );
  }

  return null;
};

export default AcceptInvitePage;
