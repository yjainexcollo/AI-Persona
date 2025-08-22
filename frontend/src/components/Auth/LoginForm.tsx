// Login form component with email/password and Google OAuth
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import AppleIcon from "@mui/icons-material/Apple";
import { useNavigate, useLocation } from "react-router-dom";
import { startProactiveTokenRefresh } from "../../utils/session";

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for registration success message from navigation state
  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      setSuccess(message);
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission and authentication
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error for unverified email
        if (
          response.status === 403 &&
          data.error &&
          data.error.includes("Email not verified")
        ) {
          throw new Error(
            "Your email is not verified. Please check your inbox and verify your account before logging in."
          );
        }
        // Handle wrong password error
        if (
          response.status === 401 &&
          data.error &&
          data.error.includes("Invalid email or password")
        ) {
          throw new Error(
            "Wrong password. Please check your password and try again."
          );
        }
        // Handle account locked error
        if (
          response.status === 423 &&
          data.error &&
          data.error.includes("Account is temporarily locked")
        ) {
          throw new Error(
            "Account is temporarily locked due to too many failed attempts. Please wait 15 minutes before trying again."
          );
        }
        throw new Error(data.error || "Login failed");
      }

      // Store the token, user, refreshToken, and workspaceId
      localStorage.setItem("token", data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      if (data.data.refreshToken)
        localStorage.setItem("refreshToken", data.data.refreshToken);
      if (data.data.workspaceId)
        localStorage.setItem("workspaceId", data.data.workspaceId);
      if (data.data.workspaceName)
        localStorage.setItem("workspaceName", data.data.workspaceName);

      // Start proactive token refresh to prevent automatic logouts
      startProactiveTokenRefresh();

      // Login successful - redirect to Discovery page
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Redirect to Google OAuth
  const handleGoogleLogin = () => {
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        pt: { xs: 6, sm: 8 },
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Left: Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: { xs: 2, sm: 4 },
          maxWidth: { xs: 420, sm: 480 },
          width: "100%",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: "100%", maxWidth: { xs: 360, sm: 370 } }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mb: { xs: 3, sm: 4 },
              color: "#222",
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            Log in
          </Typography>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography
            sx={{ fontWeight: 700, fontSize: 14, mb: 1, color: "#222" }}
          >
            Email
          </Typography>
          <TextField
            fullWidth
            name="email"
            type="email"
            placeholder="Your email"
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{
              mb: { xs: 1.5, sm: 2 },
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                height: { xs: 44, sm: 48 },
              },
            }}
          />
          <Typography
            sx={{ fontWeight: 700, fontSize: 14, mb: 1, color: "#222" }}
          >
            Password
          </Typography>
          <TextField
            fullWidth
            name="password"
            placeholder="Your password"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            required
            sx={{
              mb: 1,
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                height: { xs: 44, sm: 48 },
              },
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
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              sx={{
                color: "#526794",
                fontWeight: 600,
                fontSize: 14,
                textTransform: "none",
                p: 0,
                minWidth: 0,
              }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </Button>
          </Box>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              bgcolor: "#526794",
              color: "#fff",
              fontWeight: 700,
              fontSize: { xs: 16, sm: 18 },
              borderRadius: 2,
              py: { xs: 1.25, sm: 1.5 },
              mb: 3,
              boxShadow: "none",
              textTransform: "none",
              "&:hover": { bgcolor: "#526794" },
            }}
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}
          >
            <IconButton
              sx={{ p: 1 }}
              onClick={handleGoogleLogin}
              aria-label="Sign in with Google"
            >
              <Box
                component="img"
                src="https://th.bing.com/th?q=Google+Login+Logo.png&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&dpr=1.5&pid=InlineBlock&rm=3&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247"
                alt="Google"
                sx={{ width: 26, height: 26, objectFit: "contain" }}
              />
            </IconButton>
            <IconButton sx={{ p: 1 }} aria-label="Sign in with Apple">
              <AppleIcon sx={{ fontSize: 28, color: "#222" }} />
            </IconButton>
          </Box>
          <Typography
            sx={{
              textAlign: "center",
              color: "#444",
              fontWeight: 500,
              fontSize: { xs: 14, sm: 16 },
              mt: 1,
            }}
          >
            Don't have an account?{" "}
            <Button
              sx={{
                color: "#1a237e",
                fontWeight: 700,
                fontSize: { xs: 14, sm: 16 },
                textTransform: "none",
                p: 0,
                minWidth: 0,
              }}
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginForm;
