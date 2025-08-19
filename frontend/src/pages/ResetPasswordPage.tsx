import React from "react";
import ResetPasswordForm from "../components/Auth/ResetPasswordForm";
import { useLocation } from "react-router-dom";

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || "";
  return <ResetPasswordForm email={email} />;
};

export default ResetPasswordPage; 