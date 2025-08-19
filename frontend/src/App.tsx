/**
 * Main App Component - AI-Persona Frontend Application
 *
 * This component serves as the root of the application, handling:
 * - Material-UI theme configuration
 * - Authentication guards for protected routes
 * - Application routing with React Router
 * - Global loading states
 */

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import GlobalLoader from "./components/GlobalLoader";
import { usePageLoader } from "./hooks/usePageLoader";
import ChatPage from "./pages/ChatPage";
import ChatHistoryPage from "./pages/ChatHistoryPage";
import SettingsPage from "./pages/SettingsPage";
import PersonaSelectorPage from "./pages/PersonaSelectorPage";
import ViewPersonaPage from "./pages/ViewPersonaPage";
import AuthPage from "./pages/AuthPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
// import VerifyOtpPage from "./pages/VerifyOtpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
// import TwoFactorAuthPage from "./pages/TwoFactorAuthPage";
import RegisterPage from "./pages/RegisterPage";
import LoginAsPage from "./pages/LoginAsPage";
import ActiveUsersPage from "./pages/ActiveUsersPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import AcceptInvitePage from "./pages/AcceptInvitePage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import WorkspaceDashboard from "./pages/WorkspaceDashboard";
import WorkspaceSettingsPage from "./pages/WorkspaceSettingsPage";
import Discovery from "./pages/Discovery";
import AdminListPage from "./pages/AdminListPage";
import EmailVerificationSuccessPage from "./pages/EmailVerificationSuccessPage";
import EmailVerificationErrorPage from "./pages/EmailVerificationErrorPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import SharedConversationPage from "./pages/SharedConversationPage";
import type { Persona } from "./types";
import { logout } from "./services/authService";

/**
 * Material-UI Theme Configuration
 *
 * Defines the application's visual design system including:
 * - Color palette (blue-based primary/secondary colors)
 * - Typography settings (Inter font family)
 * - Responsive breakpoints
 * - Component style overrides
 */
const theme = createTheme({
  palette: {
    primary: {
      main: "#2950DA",
      light: "#E8ECF2",
      dark: "#526794",
    },
    secondary: {
      main: "#526794",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

/**
 * Authentication Guard Component
 *
 * Protects routes that require user authentication.
 * Redirects unauthenticated users to the login page.
 */
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

/**
 * ViewPersonaPage Wrapper Component
 *
 * Wrapper component that handles parameter passing for the ViewPersonaPage.
 * The page fetches its own data, so no props are needed.
 */
const ViewPersonaPageWithParams: React.FC = () => {
  // No need to pass persona prop; ViewPersonaPage fetches data itself
  return <ViewPersonaPage />;
};

/**
 * ChatPage Wrapper Component
 *
 * Wrapper component for the ChatPage to ensure proper navigation context.
 */
const ChatPageWithNav: React.FC = () => {
  return <ChatPage />;
};

/**
 * Discovery Page Wrapper Component
 *
 * Wrapper component that provides navigation functionality to the Discovery page.
 * Handles the start chat functionality by navigating to the chat page.
 */
const DiscoveryWithNav: React.FC = () => {
  const navigate = useNavigate();
  const handleStartChat = (persona: Persona) => {
    navigate(`/chat/${persona.id}`);
  };
  return <Discovery onStartChat={handleStartChat} />;
};

/**
 * Admin Authorization Guard Component
 *
 * Protects routes that require admin privileges.
 * Redirects non-admin users to the home page.
 */
const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role !== "ADMIN") {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

/**
 * Main Application Content Component
 *
 * Handles the core routing logic and global loading states.
 * Contains all route definitions and their respective guards.
 */
const AppContent: React.FC = () => {
  const { isLoading } = usePageLoader();
  const navigate = useNavigate();

  return (
    <>
      {/* Global loading indicator */}
      <GlobalLoader open={isLoading} message="Loading page..." />
      <Routes>
        {/* Home/Workspace Dashboard Route */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <WorkspaceDashboard
                workspaceId={
                  localStorage.getItem("workspaceId") || "demo-workspace"
                }
                workspaceName={
                  localStorage.getItem("workspaceName") || "Demo Workspace"
                }
                user={{
                  name:
                    JSON.parse(localStorage.getItem("user") || "{}").name ||
                    "Demo User",
                  role:
                    JSON.parse(localStorage.getItem("user") || "{}").role ||
                    "Member",
                  avatarUrl:
                    JSON.parse(localStorage.getItem("user") || "{}").avatar ||
                    "",
                }}
                stats={{ members: "0", users: "0" }}
                onUsePersona={() => navigate("/discovery")}
                onSignOut={logout}
              />
            </RequireAuth>
          }
        />
        {/* Discovery/Persona Browsing Route */}
        <Route
          path="/discovery"
          element={
            <RequireAuth>
              <DiscoveryWithNav />
            </RequireAuth>
          }
        />
        {/* Chat Route with Persona ID */}
        <Route
          path="/chat/:id"
          element={
            <RequireAuth>
              <ChatPageWithNav />
            </RequireAuth>
          }
        />
        {/* Chat History Route */}
        <Route path="/chat-history" element={<ChatHistoryPage />} />
        {/* Settings Route */}
        <Route path="/settings" element={<SettingsPage />} />
        {/* Workspace Settings Route (Admin Only) */}
        <Route
          path="/workspace-settings"
          element={
            <RequireAdmin>
              <WorkspaceSettingsPage />
            </RequireAdmin>
          }
        />
        {/* Persona Selection Route */}
        <Route path="/persona-selector" element={<PersonaSelectorPage />} />
        {/* View Persona Details Route */}
        <Route
          path="/view-persona/:id"
          element={<ViewPersonaPageWithParams />}
        />
        {/* Invite Acceptance Route */}
        <Route path="/accept-invite" element={<AcceptInvitePage />} />

        {/* Authentication Routes */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* <Route path="/verify-otp" element={<VerifyOtpPage />} /> */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* <Route path="/2fa" element={<TwoFactorAuthPage />} />  */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login-as" element={<LoginAsPage />} />
        <Route
          path="/api/auth/verify-email"
          element={<EmailVerificationPage />}
        />
        <Route
          path="/email-verification-success"
          element={<EmailVerificationSuccessPage />}
        />
        <Route
          path="/email-verification-error"
          element={<EmailVerificationErrorPage />}
        />

        {/* User Management Routes */}
        <Route path="/active-users" element={<ActiveUsersPage />} />
        <Route path="/admins" element={<AdminListPage />} />

        {/* Admin-Only Routes */}
        <Route
          path="/dashboard"
          element={
            <RequireAdmin>
              <DashboardPage />
            </RequireAdmin>
          }
        />

        {/* Profile Management Routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />

        {/* OAuth Callback Route */}
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

        {/* Public Shared Conversation Route */}
        <Route path="/p/:token" element={<SharedConversationPage />} />

        {/* Removed /workspace-dashboard route as it's now the home page */}
      </Routes>
    </>
  );
};

/**
 * Root App Component
 *
 * Wraps the application with theme provider and router.
 * This is the top-level component that sets up the application context.
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
