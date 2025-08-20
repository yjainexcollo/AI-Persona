/**
 * Main App Component - AI-Persona Frontend Application
 *
 * This component serves as the root of the application, handling:
 * - Authentication guards for protected routes
 * - Application routing with React Router
 * - Global loading states
 * - Route-level code splitting and a11y (skip link + focus restoration)
 */

import React, { lazy, Suspense, useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import GlobalLoader from "./components/GlobalLoader";
import { usePageLoader } from "./hooks/usePageLoader";
import BrandLogo from "./components/BrandLogo";
const ChatPage = lazy(() => import("./pages/ChatPage"));
const ChatHistoryPage = lazy(() => import("./pages/ChatHistoryPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const PersonaSelectorPage = lazy(() => import("./pages/PersonaSelectorPage"));
const ViewPersonaPage = lazy(() => import("./pages/ViewPersonaPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const LoginAsPage = lazy(() => import("./pages/LoginAsPage"));
const ActiveUsersPage = lazy(() => import("./pages/ActiveUsersPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const EditProfilePage = lazy(() => import("./pages/EditProfilePage"));
const AcceptInvitePage = lazy(() => import("./pages/AcceptInvitePage"));
const OAuthCallbackPage = lazy(() => import("./pages/OAuthCallbackPage"));
const WorkspaceDashboard = lazy(() => import("./pages/WorkspaceDashboard"));
const WorkspaceSettingsPage = lazy(
  () => import("./pages/WorkspaceSettingsPage")
);
const Discovery = lazy(() => import("./pages/Discovery"));
const AdminListPage = lazy(() => import("./pages/AdminListPage"));
const EmailVerificationSuccessPage = lazy(
  () => import("./pages/EmailVerificationSuccessPage")
);
const EmailVerificationErrorPage = lazy(
  () => import("./pages/EmailVerificationErrorPage")
);
const EmailVerificationPage = lazy(
  () => import("./pages/EmailVerificationPage")
);
const SharedConversationPage = lazy(
  () => import("./pages/SharedConversationPage")
);
import type { Persona } from "./types";
import { logout } from "./services/authService";

// Theme is provided at the root in main.tsx

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
  const location = useLocation();
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, [location]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <BrandLogo />
      {/* Keep route fallback only; page overlay is controlled by hook if re-enabled */}
      <Suspense fallback={<GlobalLoader open message="Loading page..." />}>
        <main id="main-content" ref={mainRef} tabIndex={-1} role="main">
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
                        JSON.parse(localStorage.getItem("user") || "{}")
                          .avatar || "",
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
          </Routes>
        </main>
      </Suspense>
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
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
