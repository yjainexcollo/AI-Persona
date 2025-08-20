import React, { useState } from "react";
import { Box, Typography, TextField, Button, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendEmail = async () => {
    setError("");
    setLoading(true);
    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      await fetch(`${backendUrl}/api/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always show the same message for security
      setEmailSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#fff",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: 4,
          maxWidth: 480,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 370 }}>
          {!emailSent ? (
            <>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, mb: 3, color: "#222" }}
              >
                Forgot Password
              </Typography>
              <Typography
                sx={{ color: "#6b7280", fontWeight: 500, fontSize: 16, mb: 3 }}
              >
                No worries, we'll send a recovery link to your email.
              </Typography>
              <Typography
                sx={{ fontWeight: 700, fontSize: 16, mb: 1, color: "#222" }}
              >
                Email
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
                error={!!error}
                helperText={error}
              />
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: "#526794",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 18,
                  borderRadius: 2,
                  py: 1.5,
                  mb: 3,
                  boxShadow: "none",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#526794" },
                  "&:disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
                }}
                onClick={handleSendEmail}
                disabled={!email || loading}
              >
                {loading ? "Checking..." : "Send a recovery link"}
              </Button>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}
              >
                <Typography
                  sx={{ color: "#6b7280", fontWeight: 500, fontSize: 16 }}
                >
                  Back to
                </Typography>
                <Button
                  onClick={() => navigate("/login")}
                  sx={{
                    color: "#2950DA",
                    fontWeight: 700,
                    fontSize: 16,
                    textTransform: "none",
                    p: 0,
                    minWidth: 0,
                  }}
                >
                  Login
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, mb: 3, color: "#222" }}
              >
                Password recovery
              </Typography>
              <Typography
                sx={{ fontWeight: 700, fontSize: 18, color: "#222", mb: 1.5 }}
              >
                Check your email
              </Typography>
              <Typography
                sx={{
                  color: "#6b7280",
                  fontWeight: 500,
                  fontSize: 16,
                  mb: 0.5,
                }}
              >
                If an account with <b>{email || "email@email.com"}</b> exists, a
                password reset link has been sent.
              </Typography>
              <Typography
                sx={{ color: "#6b7280", fontWeight: 500, fontSize: 16, mb: 3 }}
              >
                Please check your inbox and follow the instructions to reset
                your password.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 4,
                }}
              >
                <Link
                  component="button"
                  underline="none"
                  sx={{
                    color: "#222",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: "pointer",
                    p: 0,
                  }}
                  onClick={() => setEmailSent(false)}
                >
                  Resend e-mail
                </Link>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography
                    sx={{ color: "#6b7280", fontWeight: 500, fontSize: 16 }}
                  >
                    Back to
                  </Typography>
                  <Button
                    onClick={() => navigate("/login")}
                    sx={{
                      color: "#2950DA",
                      fontWeight: 700,
                      fontSize: 16,
                      textTransform: "none",
                      p: 0,
                      minWidth: 0,
                    }}
                  >
                    Login
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPasswordForm;
