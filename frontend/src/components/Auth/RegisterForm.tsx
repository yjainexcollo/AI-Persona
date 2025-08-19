import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link,
  Alert,
} from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import TermsAndConditionsDialog from "./TermsAndConditionsDialog";
import { useNavigate } from "react-router-dom";

interface RegisterFormProps {
  inviteToken?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password validation rules
  const passwordRules = [
    { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
    {
      label: "At least one uppercase letter (A-Z)",
      test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      label: "At least one lowercase letter (a-z)",
      test: (pw: string) => /[a-z]/.test(pw),
    },
    { label: "At least one number (0-9)", test: (pw: string) => /\d/.test(pw) },
    {
      label: "At least one special character (@$!%*?&)",
      test: (pw: string) => /[@$!%*?&]/.test(pw),
    },
  ];

  const allPasswordRulesValid = passwordRules.every((rule) =>
    rule.test(formData.password)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resendVerification = async (email: string) => {
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const response = await fetch(`${backendUrl}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to resend verification email");
    }
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please agree to the Terms and Conditions");
      return;
    }
    if (!allPasswordRulesValid) {
      setError("Please ensure your password meets all requirements");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        // Handle specific validation errors
        if (
          response.status === 400 &&
          data.error &&
          data.error.includes("Validation failed")
        ) {
          throw new Error(data.error);
        }
        // If email is already registered but not verified, trigger resend verification
        if (
          (response.status === 409 || response.status === 400) &&
          data.error &&
          (data.error.toLowerCase().includes("already registered") ||
            data.error.toLowerCase().includes("pending verify"))
        ) {
          try {
            await resendVerification(formData.email);
            setError(
              "Your email is already registered but not verified. We have resent the verification email. Please check your inbox."
            );
          } catch (resendErr) {
            setError(
              resendErr instanceof Error
                ? resendErr.message
                : "Failed to resend verification email."
            );
          }
          return;
        }
        throw new Error(data.error || "Registration failed");
      }
      // Registration successful - redirect to login with email verification message
      navigate("/login", {
        state: {
          message:
            "Registration successful! Please check your email and verify your account before logging in.",
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxClick = (
    e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent
  ) => {
    e.preventDefault();
    if (agreed) {
      setAgreed(false);
    } else {
      setTermsOpen(true);
    }
  };

  const handleAgree = () => {
    setAgreed(true);
    setTermsOpen(false);
  };

  const handleClose = () => {
    setTermsOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: "#fff",
          justifyContent: "center",
          alignItems: "center",
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
            px: 4,
            maxWidth: 480,
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ width: "100%", maxWidth: 370 }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                mb: 2.5,
                color: "#222",
                textAlign: "left",
              }}
            >
              Create Account
            </Typography>
            <Typography
              sx={{
                color: "#6b7280",
                fontWeight: 500,
                fontSize: 16,
                mb: 3,
                textAlign: "left",
                lineHeight: 1.3,
              }}
            >
              Fill your information below or register with your social account
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Typography
              sx={{ fontWeight: 700, fontSize: 16, mb: 1, color: "#222" }}
            >
              Full Name
            </Typography>
            <TextField
              fullWidth
              name="name"
              placeholder="Your name"
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{
                mb: 2,
                borderRadius: 2,
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
            <Typography
              sx={{ fontWeight: 700, fontSize: 16, mb: 1, color: "#222" }}
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
                mb: 2,
                borderRadius: 2,
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
            <Typography
              sx={{ fontWeight: 700, fontSize: 16, mb: 1, color: "#222" }}
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
            />
            {/* Password validation rules */}
            {formData.password && (
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: "#f8f9fa",
                  borderRadius: 2,
                  border: "1px solid #e9ecef",
                }}
              >
                <Typography
                  sx={{ fontWeight: 600, fontSize: 14, mb: 1, color: "#222" }}
                >
                  Password requirements:
                </Typography>
                {passwordRules.map((rule, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                  >
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        bgcolor: rule.test(formData.password)
                          ? "#2950DA"
                          : "#d1d5db",
                        mr: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {rule.test(formData.password) && (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: "#fff",
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: rule.test(formData.password)
                          ? "#2950DA"
                          : "#6b7280",
                        fontWeight: rule.test(formData.password) ? 600 : 400,
                      }}
                    >
                      {rule.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreed}
                  onClick={handleCheckboxClick}
                  onChange={handleCheckboxClick}
                  sx={{ p: 0.5, mr: 1 }}
                />
              }
              label={
                <Typography
                  sx={{ fontSize: 14, color: "#222", fontWeight: 400 }}
                >
                  I agree with{" "}
                  <Link
                    href="#"
                    underline="always"
                    sx={{
                      color: "#3269b8",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                    onClick={(e) => e.preventDefault()}
                  >
                    Privacy Policy and Terms and Conditions
                  </Link>
                </Typography>
              }
              sx={{
                mb: 3,
                alignItems: "flex-start",
                ".MuiFormControlLabel-label": { mt: 0.2 },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!agreed || loading || !allPasswordRulesValid}
              sx={{
                bgcolor:
                  !agreed || !allPasswordRulesValid ? "#d1d5db" : "#526794",
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                borderRadius: 2,
                py: 1.5,
                mb: 3,
                boxShadow: "none",
                textTransform: "none",
                "&:hover": {
                  bgcolor:
                    !agreed || !allPasswordRulesValid ? "#d1d5db" : "#526794",
                },
              }}
            >
              {loading ? "Signing up..." : "Sign up"}
            </Button>
            <Typography
              sx={{
                color: "#8a8a8a",
                fontSize: 16,
                fontWeight: 400,
                textAlign: "left",
              }}
            >
              Already have an account?{" "}
              <Link
                href="#"
                underline="none"
                sx={{
                  color: "#222",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                }}
                onClick={() => navigate("/login")}
              >
                Log in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
      <TermsAndConditionsDialog
        open={termsOpen}
        onClose={handleClose}
        onAgree={handleAgree}
      />
    </>
  );
};

export default RegisterForm;
