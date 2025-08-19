import React from "react";
import { Box, Typography, Button, Paper, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const EmailVerificationErrorPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate("/login");
  };

  const handleGoToRegister = () => {
    navigate("/register");
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
          {/* Error Icon */}
          <Box sx={{ mb: 3 }}>
            <ErrorOutlineIcon
              sx={{
                fontSize: 80,
                color: "#d32f2f",
                mb: 2,
              }}
            />
          </Box>

          {/* Error Message */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#222",
              mb: 2,
            }}
          >
            Verification Failed
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#666",
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            The email verification link is invalid or has expired. This could
            happen if:
          </Typography>

          <Box sx={{ textAlign: "left", mb: 4 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                mb: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              • The link has expired (links expire after 60 minutes)
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                mb: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              • The link was already used
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                mb: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              • The link is malformed or incorrect
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleGoToLogin}
              sx={{
                bgcolor: "#2950DA",
                color: "#fff",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: 14,
                "&:hover": {
                  bgcolor: "#526794",
                },
              }}
            >
              Go to Login
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={handleGoToRegister}
              sx={{
                borderColor: "#2950DA",
                color: "#2950DA",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: 14,
                "&:hover": {
                  borderColor: "#526794",
                  bgcolor: "rgba(41, 80, 218, 0.04)",
                },
              }}
            >
              Register Again
            </Button>
          </Box>

          {/* Additional Info */}
          <Typography
            variant="caption"
            sx={{
              color: "#888",
              mt: 3,
              display: "block",
            }}
          >
            If you're having trouble, you can try registering again or contact
            support.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerificationErrorPage;
