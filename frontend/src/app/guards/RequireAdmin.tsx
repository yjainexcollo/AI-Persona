import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { storage } from "@/lib/storage/localStorage";
import { paths } from "@/lib/routing/paths";

type Props = { children: React.ReactNode };

const RequireAdmin: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const user = storage.getUser();
  if (!user || user.role !== "ADMIN") {
    return <Navigate to={paths.root} state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export default RequireAdmin;
