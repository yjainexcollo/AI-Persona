import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/app/routes/AppRoutes";

const AppRoot: React.FC = () => {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AppRoutes />
    </BrowserRouter>
  );
};

export default AppRoot;
