import React, { useRef, useState } from "react";
import { Box, Typography, Button, TextField, Link } from "@mui/material";

interface TwoFactorAuthFormProps {
  email?: string;
}

const TwoFactorAuthForm: React.FC<TwoFactorAuthFormProps> = ({
  email = "Email@gmail.com",
}) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);
    if (value && idx < 5) {
      inputs[idx + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputs[idx - 1]?.current?.focus();
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fff" }}>
      {/* Left: Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: 4,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 370 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, mb: 3, color: "#222", textAlign: "center" }}
          >
            Verify OTP
          </Typography>
          <Typography
            sx={{
              color: "#6b7280",
              fontWeight: 500,
              fontSize: 16,
              mb: 0.5,
              textAlign: "center",
            }}
          >
            Enter Verification Code
          </Typography>
          <Typography
            sx={{
              color: "#2950DA",
              fontWeight: 700,
              fontSize: 16,
              mb: 3,
              textAlign: "center",
            }}
          >
            {email}
          </Typography>
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}
          >
            {code.map((digit, idx) => (
              <TextField
                key={idx}
                inputRef={inputs[idx]}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                inputProps={{
                  maxLength: 1,
                  style: {
                    textAlign: "center",
                    fontSize: 28,
                    fontWeight: 700,
                    width: 48,
                    height: 48,
                    padding: 0,
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    width: 48,
                    height: 48,
                    fontWeight: 700,
                    fontSize: 28,
                  },
                }}
              />
            ))}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              sx={{ color: "#8a8a8a", fontSize: 14, fontWeight: 400, mr: 0.5 }}
            >
              Didn't receive code ?
            </Typography>
            <Link
              href="#"
              underline="none"
              sx={{
                color: "#1a237e",
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
                ml: 0.5,
              }}
            >
              Resend
            </Link>
          </Box>
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
              mb: 2,
              boxShadow: "none",
              textTransform: "none",
              "&:hover": { bgcolor: "#526794" },
            }}
          >
            Verify
          </Button>
          <Box sx={{ textAlign: "center", mt: 1 }}>
            <Link
              href="#"
              underline="none"
              sx={{
                color: "#6b7280",
                fontWeight: 500,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Go back
            </Link>
          </Box>
        </Box>
      </Box>
      {/* Right: Image */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#526794",
          height: "100vh",
          position: "relative",
        }}
      >
        <Box
          component="img"
          src="https://th.bing.com/th/id/OIP.cFeKv_CFZJQcGRXPuj4neAHaEa?w=292&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3"
          alt="Pine Labs Devices"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: 0,
            boxShadow: "none",
            background: "transparent",
            maxHeight: "70%",
          }}
        />
      </Box>
    </Box>
  );
};

export default TwoFactorAuthForm;
