import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { startProactiveTokenRefresh } from "../utils/session";

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse token from query string
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    const workspaceName = params.get("workspaceName");
    const workspaceId = params.get("workspaceId");
    const user = params.get("user");

    if (token) {
      localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      if (workspaceName) localStorage.setItem("workspaceName", workspaceName);
      if (workspaceId) localStorage.setItem("workspaceId", workspaceId);
      if (user) localStorage.setItem("user", user);

      // Start proactive token refresh to prevent automatic logouts
      startProactiveTokenRefresh();

      // Optionally, fetch user info here if needed
      navigate("/", { replace: true });
    } else {
      // No token found, redirect to login
      navigate("/login", {
        replace: true,
        state: { message: "OAuth failed or was cancelled." },
      });
    }
  }, [location, navigate]);

  return <div>Processing login...</div>;
};

export default OAuthCallbackPage;
