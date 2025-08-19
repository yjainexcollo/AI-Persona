import React from "react";
import RegisterForm from "../components/Auth/RegisterForm";
import { useSearchParams } from "react-router-dom";

const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  return <RegisterForm inviteToken={token} />;
};

export default RegisterPage; 