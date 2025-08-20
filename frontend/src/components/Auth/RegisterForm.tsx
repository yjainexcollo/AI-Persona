import React, { useState, useRef, useEffect } from "react";
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import TermsAndConditionsDialog from "./TermsAndConditionsDialog";
import { useNavigate } from "react-router-dom";

interface RegisterFormProps {
  inviteToken?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showPassword, setShowPassword] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordFieldRef = useRef<HTMLDivElement>(null);
  const checklistRef = useRef<HTMLDivElement>(null);

  // Password validation rules
  const passwordRules = [
    { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
    {
      label: "At least one uppercase letter (A-Z)",
      test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      label: "At least one number (0-9)",
      test: (pw: string) => /\d/.test(pw),
    },
    {
      label: "At least one special character (!@#$%^&*)",
      test: (pw: string) => /[!@#$%^&*]/.test(pw),
    },
  ];

  const allPasswordRulesValid = passwordRules.every((rule) =>
    rule.test(formData.password)
  );

  // Handle clicks outside password field and checklist
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        passwordFieldRef.current &&
        checklistRef.current &&
        !passwordFieldRef.current.contains(event.target as Node) &&
        !checklistRef.current.contains(event.target as Node)
      ) {
        setPasswordFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-hide checklist when all requirements are met
  useEffect(() => {
    if (allPasswordRulesValid && passwordFocused) {
      const timer = setTimeout(() => setPasswordFocused(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [allPasswordRulesValid, passwordFocused]);

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

  const isFormValid =
    agreed && allPasswordRulesValid && formData.name && formData.email;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: "#fff",
          justifyContent: "center",
          alignItems: "center",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 },
          pt: { xs: 5, sm: 5 },
        }}
      >
        {/* Form Container */}
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: 440, md: 480 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", sm: 380, md: 420 },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: { xs: 1.5, sm: 2, md: 2.5 },
                color: "#222",
                textAlign: "center",
                fontSize: { xs: "22px", sm: "24px", md: "28px" },
                lineHeight: 1.25,
              }}
            >
              Create Account
            </Typography>
            <Typography
              sx={{
                color: "#6b7280",
                fontWeight: 500,
                fontSize: { xs: 13, sm: 14, md: 16 },
                mb: { xs: 2, sm: 2.5, md: 3 },
                textAlign: "center",
                lineHeight: 1.4,
                px: { xs: 1, sm: 0 },
              }}
            >
              Fill your information below or register with your crudo account
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: { xs: 2, sm: 2.5 },
                  fontSize: { xs: 14, sm: 16 },
                }}
              >
                {error}
              </Alert>
            )}

            {/* Full Name Field */}
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: 13, sm: 14, md: 16 },
                mb: { xs: 0.75, sm: 1.25 },
                color: "#222",
              }}
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
                mb: { xs: 1.75, sm: 2.25 },
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: { xs: 13, sm: 14 },
                  height: { xs: 44, sm: 52 },
                },
              }}
            />

            {/* Email Field */}
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: 13, sm: 14, md: 16 },
                mb: { xs: 0.75, sm: 1.25 },
                color: "#222",
              }}
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
                mb: { xs: 1.75, sm: 2.25 },
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: { xs: 13, sm: 14 },
                  height: { xs: 44, sm: 52 },
                },
              }}
            />

            {/* Password Field */}
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: 13, sm: 14, md: 16 },
                mb: { xs: 0.75, sm: 1.25 },
                color: "#222",
              }}
            >
              Password
            </Typography>
            <Box ref={passwordFieldRef} sx={{ position: "relative" }}>
              <TextField
                fullWidth
                name="password"
                placeholder="Your password"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setPasswordFocused(true)}
                required
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: { xs: 13, sm: 14 },
                    height: { xs: 44, sm: 52 },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size={isMobile ? "small" : "medium"}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password Checklist */}
              {passwordFocused && formData.password && (
                <Box
                  ref={checklistRef}
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    mt: 1,
                    p: { xs: 1.5, sm: 2 },
                    bgcolor: "#f8f9fa",
                    borderRadius: 2,
                    border: "1px solid #e9ecef",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    maxWidth: { xs: "100%", sm: "none" },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: 12, sm: 13 },
                      mb: { xs: 0.75, sm: 1 },
                      color: "#222",
                    }}
                  >
                    Password requirements:
                  </Typography>
                  {passwordRules.map((rule, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: { xs: 0.5, sm: 0.75 },
                        gap: 1,
                      }}
                    >
                      {rule.test(formData.password) ? (
                        <CheckCircleIcon
                          sx={{
                            color: "#2950DA",
                            fontSize: { xs: 16, sm: 18 },
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <RadioButtonUncheckedIcon
                          sx={{
                            color: "#d1d5db",
                            fontSize: { xs: 16, sm: 18 },
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Typography
                        sx={{
                          fontSize: { xs: 12, sm: 13 },
                          color: rule.test(formData.password)
                            ? "#2950DA"
                            : "#6b7280",
                          fontWeight: rule.test(formData.password) ? 600 : 400,
                          lineHeight: 1.3,
                        }}
                      >
                        {rule.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Terms and Conditions */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreed}
                  onClick={handleCheckboxClick}
                  onChange={handleCheckboxClick}
                  sx={{
                    p: { xs: 0.5, sm: 0.75 },
                    mr: 0.0,
                    alignSelf: "flex-start",
                    mt: -0.6,
                    ml: 0.5,
                    "& .MuiSvgIcon-root": {
                      fontSize: { xs: 18, sm: 20 },
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: { xs: 13, sm: 14, md: 15 },
                    color: "#222",
                    fontWeight: 400,
                    lineHeight: 1.4,
                  }}
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
                mb: { xs: 2.5, sm: 3, md: 3.5 },
                alignItems: "flex-start",
                ".MuiFormControlLabel-label": {
                  mt: 0,
                },
              }}
            />

            {/* Sign Up Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!isFormValid || loading}
              sx={{
                bgcolor: isFormValid ? "#2950DA" : "#e5e7eb",
                color: isFormValid ? "#fff" : "#9ca3af",
                fontWeight: 700,
                fontSize: { xs: 15, sm: 16, md: 18 },
                borderRadius: 2,
                py: { xs: 1.25, sm: 1.5, md: 1.75 },
                mb: { xs: 2, sm: 2.5, md: 3 },
                boxShadow: isFormValid
                  ? "0 4px 12px rgba(41, 80, 218, 0.3)"
                  : "none",
                textTransform: "none",
                height: { xs: 44, sm: 52, md: 56 },
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: isFormValid ? "#1e40af" : "#e5e7eb",
                  boxShadow: isFormValid
                    ? "0 6px 20px rgba(41, 80, 218, 0.4)"
                    : "none",
                  transform: isFormValid ? "translateY(-1px)" : "none",
                },
                "&:disabled": {
                  bgcolor: "#e5e7eb",
                  color: "#9ca3af",
                  opacity: 0.6,
                  cursor: "not-allowed",
                  transform: "none",
                },
              }}
            >
              {loading ? "Signing up..." : "Sign up"}
            </Button>

            {/* Login Link */}
            <Typography
              sx={{
                color: "#8a8a8a",
                fontSize: { xs: 13, sm: 14, md: 16 },
                fontWeight: 400,
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              Already have an account?{" "}
              <Link
                href="#"
                underline="none"
                sx={{
                  color: "#2950DA",
                  fontWeight: 700,
                  fontSize: { xs: 13, sm: 14, md: 16 },
                  cursor: "pointer",
                  "&:hover": {
                    color: "#1e40af",
                    textDecoration: "underline",
                  },
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
