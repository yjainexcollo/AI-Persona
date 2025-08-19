import React from "react";
import VerifyOtpForm from "../components/Auth/VerifyOtpForm";
import { useLocation } from "react-router-dom";

const VerifyOtpPage: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || "";
  return <VerifyOtpForm email={email} />;
};

export default VerifyOtpPage; 