import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { storage } from "@/lib/storage/localStorage";
import { paths } from "@/lib/routing/paths";

type Props = { children: React.ReactNode };

const RequireAuth: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const token = storage.getToken();
  if (!token) {
    return <Navigate to={paths.login} state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;
