import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import { useNavigate, useSearchParams } from "react-router-dom";
import { env } from "../../lib/config/env";

const passwordRules = [
  {
    label: "At least one capital letter",
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    label: "At least one lowercase letter",
    test: (pw: string) => /[a-z]/.test(pw),
  },
  { label: "At least one number", test: (pw: string) => /\d/.test(pw) },
  {
    label: "Minimum character length is 8 characters",
    test: (pw: string) => pw.length >= 8,
  },
];

const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const allValid = passwordRules.every((rule) => rule.test(password));
  const canSubmit =
    allValid &&
    password === confirmPassword &&
    password.length > 0 &&
    !loading &&
    !!token;

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const BACKEND_URL = env.BACKEND_URL;
      const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, newPassword: confirmPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to reset password.");
        setLoading(false);
        return;
      }
      setSuccessDialogOpen(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setSuccessDialogOpen(false);
    navigate("/login");
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#fff",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: 10,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 420,
          px: 1,
          py: 2,
          boxShadow: 0,
          borderRadius: 3,
          mx: "auto",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: "#222" }}>
          New password
        </Typography>
        <Typography
          sx={{ color: "#6b7280", fontWeight: 500, fontSize: 18, mb: 2 }}
        >
          Enter a new password for your account
        </Typography>
        <Typography
          sx={{ fontWeight: 700, fontSize: 16, mb: 0.5, color: "#222" }}
        >
          New Password
        </Typography>
        <TextField
          fullWidth
          placeholder="Your new password"
          variant="outlined"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            mb: 1.5,
            borderRadius: 2,
            "& .MuiOutlinedInput-root": { borderRadius: 2 },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((v) => !v)}
                  edge="end"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          error={!!error && !allValid}
        />
        <Typography
          sx={{ fontWeight: 700, fontSize: 16, mb: 0.5, color: "#222" }}
        >
          Confirm New Password
        </Typography>
        <TextField
          fullWidth
          placeholder="Confirm your new password"
          variant="outlined"
          type={showConfirm ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{
            mb: 1.5,
            borderRadius: 2,
            "& .MuiOutlinedInput-root": { borderRadius: 2 },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirm((v) => !v)}
                  edge="end"
                >
                  {showConfirm ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          error={!!error && password !== confirmPassword}
        />
        <Typography
          sx={{ fontWeight: 700, fontSize: 16, mb: 0.5, color: "#222" }}
        >
          Your password must contain
        </Typography>
        <Box component="ul" sx={{ pl: 0, mb: 2, listStyle: "none" }}>
          {passwordRules.map((rule, idx) => (
            <Box
              key={idx}
              component="li"
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 0.2,
                color: rule.test(password) ? "#2950DA" : "#6b7280",
                fontSize: 15,
                fontWeight: rule.test(password) ? 700 : 400,
              }}
            >
              <span
                style={{
                  color: rule.test(password) ? "#2950DA" : "#bdbdbd",
                  fontWeight: 700,
                  fontSize: 18,
                  marginRight: 8,
                }}
              >
                ✔
              </span>{" "}
              {rule.label}
            </Box>
          ))}
        </Box>
        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: canSubmit ? "#2950DA" : "#bdbdbd",
            color: "#fff",
            fontWeight: 700,
            fontSize: 20,
            borderRadius: 2,
            py: 1.2,
            mb: 2,
            boxShadow: "none",
            textTransform: "none",
            "&:hover": { bgcolor: canSubmit ? "#526794" : "#bdbdbd" },
          }}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {loading ? "Setting..." : "Set new password"}
        </Button>
        {error && (
          <Typography sx={{ color: "red", textAlign: "center", mb: 1 }}>
            {error}
          </Typography>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography sx={{ color: "#6b7280", fontWeight: 500, fontSize: 16 }}>
            Back to
          </Typography>
          <Button
            href="/login"
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
        <Dialog open={successDialogOpen} onClose={handleDialogClose}>
          <DialogTitle>Password Reset Successful</DialogTitle>
          <DialogContent>
            <Typography>Your password has been reset successfully.</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleDialogClose}
              variant="contained"
              color="primary"
            >
              Login
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ResetPasswordForm;
