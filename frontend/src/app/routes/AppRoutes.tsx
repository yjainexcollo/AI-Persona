import React, { lazy, Suspense, useRef, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import RequireAuth from "@/app/guards/RequireAuth";
import RequireAdmin from "@/app/guards/RequireAdmin";
import { paths } from "@/lib/routing/paths";
import GlobalLoader from "@/components/GlobalLoader";
import type { Persona } from "@/types";
import { storage } from "@/lib/storage/localStorage";
import { logout } from "@/services/authService";

const ChatPage = lazy(() => import("@/pages/ChatPage"));
const ChatHistoryPage = lazy(() => import("@/pages/ChatHistoryPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const PersonaSelectorPage = lazy(() => import("@/pages/PersonaSelectorPage"));
const ViewPersonaPage = lazy(() => import("@/pages/ViewPersonaPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const LoginAsPage = lazy(() => import("@/pages/LoginAsPage"));
const ActiveUsersPage = lazy(() => import("@/pages/ActiveUsersPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const EditProfilePage = lazy(() => import("@/pages/EditProfilePage"));
const AcceptInvitePage = lazy(() => import("@/pages/AcceptInvitePage"));
const OAuthCallbackPage = lazy(() => import("@/pages/OAuthCallbackPage"));
const WorkspaceDashboard = lazy(() => import("@/pages/WorkspaceDashboard"));
const WorkspaceSettingsPage = lazy(
  () => import("@/pages/WorkspaceSettingsPage")
);
const Discovery = lazy(() => import("@/pages/Discovery"));
const AdminListPage = lazy(() => import("@/pages/AdminListPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const EmailVerificationSuccessPage = lazy(
  () => import("@/pages/EmailVerificationSuccessPage")
);
const EmailVerificationErrorPage = lazy(
  () => import("@/pages/EmailVerificationErrorPage")
);
const EmailVerificationPage = lazy(
  () => import("@/pages/EmailVerificationPage")
);
const SharedConversationPage = lazy(
  () => import("@/pages/SharedConversationPage")
);

const ViewPersonaPageWithParams: React.FC = () => {
  return <ViewPersonaPage />;
};

const ChatPageWithNav: React.FC = () => {
  return <ChatPage />;
};

const DiscoveryWithNav: React.FC = () => {
  const navigate = useNavigate();
  const handleStartChat = (persona: Persona) => {
    navigate(paths.chat(persona.id));
  };
  return <Discovery onStartChat={handleStartChat} />;
};

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
      <Suspense fallback={<GlobalLoader open message="Loading page..." />}>
        <main id="main-content" ref={mainRef} tabIndex={-1} role="main">
          <Routes>
            <Route
              path={paths.root}
              element={
                <RequireAuth>
                  <WorkspaceDashboard
                    workspaceId={storage.getWorkspaceId() || "demo-workspace"}
                    workspaceName={
                      storage.getWorkspaceName() || "Demo Workspace"
                    }
                    user={{
                      name: storage.getUser()?.name || "Demo User",
                      role: storage.getUser()?.role || "Member",
                      avatarUrl: (storage.getUser() as any)?.avatar || "",
                    }}
                    stats={{ members: "0", users: "0" }}
                    onUsePersona={() => navigate(paths.discovery)}
                    onSignOut={logout}
                  />
                </RequireAuth>
              }
            />
            <Route
              path={paths.discovery}
              element={
                <RequireAuth>
                  <DiscoveryWithNav />
                </RequireAuth>
              }
            />
            <Route
              path={paths.chat(":id")}
              element={
                <RequireAuth>
                  <ChatPageWithNav />
                </RequireAuth>
              }
            />
            <Route
              path={paths.chatHistory}
              element={
                <RequireAuth>
                  <ChatHistoryPage />
                </RequireAuth>
              }
            />
            <Route path={paths.settings} element={<SettingsPage />} />
            <Route
              path={paths.workspaceSettings}
              element={
                <RequireAdmin>
                  <WorkspaceSettingsPage />
                </RequireAdmin>
              }
            />
            <Route
              path={paths.personaSelector}
              element={<PersonaSelectorPage />}
            />
            <Route
              path={paths.viewPersona(":id")}
              element={<ViewPersonaPageWithParams />}
            />
            <Route path={paths.acceptInvite} element={<AcceptInvitePage />} />

            <Route
              path={paths.forgotPassword}
              element={<ForgotPasswordPage />}
            />
            <Route path={paths.resetPassword} element={<ResetPasswordPage />} />
            <Route path={paths.login} element={<AuthPage />} />
            <Route path={paths.register} element={<RegisterPage />} />
            <Route path={paths.loginAs} element={<LoginAsPage />} />
            <Route
              path={paths.emailVerify}
              element={<EmailVerificationPage />}
            />
            <Route
              path={paths.emailVerificationSuccess}
              element={<EmailVerificationSuccessPage />}
            />
            <Route
              path={paths.emailVerificationError}
              element={<EmailVerificationErrorPage />}
            />

            <Route path={paths.activeUsers} element={<ActiveUsersPage />} />
            <Route path={paths.admins} element={<AdminListPage />} />
            <Route path={paths.notifications} element={<NotificationsPage />} />

            <Route
              path={paths.dashboard}
              element={
                <RequireAdmin>
                  <DashboardPage />
                </RequireAdmin>
              }
            />

            <Route path={paths.profile} element={<ProfilePage />} />
            <Route path={paths.editProfile} element={<EditProfilePage />} />
            <Route path={paths.oauthCallback} element={<OAuthCallbackPage />} />
            <Route
              path={paths.sharedConversation(":token")}
              element={<SharedConversationPage />}
            />

            <Route path="*" element={<Navigate to={paths.root} replace />} />
          </Routes>
        </main>
      </Suspense>
    </>
  );
};

export default AppRoutes;
