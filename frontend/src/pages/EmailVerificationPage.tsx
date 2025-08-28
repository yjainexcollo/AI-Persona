import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Container,
} from "@mui/material";
import { env } from "../lib/config/env";

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const hasVerified = useRef(false); // Prevent double call

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        if (!token) {
          setTimeout(() => {
            navigate("/email-verification-error");
          }, 2000);
          return;
        }
        const BACKEND_URL = env.BACKEND_URL;
        const response = await fetch(
          `${BACKEND_URL}/api/auth/verify-email?token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          navigate("/email-verification-success");
        } else {
          throw new Error(data.message || "Verification failed");
        }
      } catch (err: any) {
        setTimeout(() => {
          navigate("/email-verification-error");
        }, 2000);
      }
    };
    verifyEmail();
  }, [searchParams, navigate]);

  if (isVerifying) {
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
            <CircularProgress sx={{ mb: 3 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#222",
                mb: 2,
              }}
            >
              Verifying your email...
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
              }}
            >
              Please wait while we verify your email address.
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return null;
};

export default EmailVerificationPage;
