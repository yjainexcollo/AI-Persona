import React from "react";
import RegisterForm from "../components/Auth/RegisterForm";
import { useSearchParams } from "react-router-dom";
import { Box } from "@mui/material";

const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Brand (top-left, fixed) */}
      <Box
        component="a"
        href="/"
        aria-label="Go to home"
        sx={{
          position: "fixed",
          top: { xs: 12, sm: 16 },
          left: { xs: 12, sm: 16 },
          display: "flex",
          alignItems: "center",
          gap: 1,
          textDecoration: "none",
          zIndex: (theme) => theme.zIndex.appBar + 1,
        }}
      >
        <Box
          component="img"
          src="/logo.png"
          alt="crudo.ai logo"
          loading="lazy"
          sx={{ height: { xs: 28, sm: 50 }, width: "auto" }}
        />
      </Box>

      <RegisterForm inviteToken={token} />
    </Box>
  );
};

export default RegisterPage;
