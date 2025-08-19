import React from "react";
import { Box, Typography, Button, Paper, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const EmailVerificationSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f7f8fa",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxWidth: 500,
            width: "100%",
          }}
        >
          {/* Success Icon */}
          <Box sx={{ mb: 3 }}>
            <CheckCircleIcon
              sx={{
                fontSize: 80,
                color: "#2950DA",
                mb: 2,
              }}
            />
          </Box>

          {/* Success Message */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#222",
              mb: 2,
            }}
          >
            Email Verified Successfully!
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#666",
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Your email address has been successfully verified. You can now log
            in to your account and start using AI-Persona.
          </Typography>

          {/* Action Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleGoToLogin}
            sx={{
              bgcolor: "#2950DA",
              color: "#fff",
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: 16,
              "&:hover": {
                bgcolor: "#526794",
              },
            }}
          >
            Go to Login
          </Button>

          {/* Additional Info */}
          <Typography
            variant="caption"
            sx={{
              color: "#888",
              mt: 3,
              display: "block",
            }}
          >
            You will be redirected to the login page where you can sign in with
            your credentials.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerificationSuccessPage;
