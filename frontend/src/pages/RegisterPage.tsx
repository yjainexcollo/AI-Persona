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
      <RegisterForm inviteToken={token} />
    </Box>
  );
};

export default RegisterPage;
