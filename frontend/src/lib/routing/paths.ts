/**
 * Centralized route path helpers
 */

export const paths = {
  root: "/",
  discovery: "/discovery",
  chat: (id: string | ":id" = ":id") => `/chat/${id}`,
  chatHistory: "/chat-history",
  settings: "/settings",
  workspaceSettings: "/workspace-settings",
  personaSelector: "/persona-selector",
  viewPersona: (id: string | ":id" = ":id") => `/view-persona/${id}`,
  acceptInvite: "/accept-invite",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  login: "/login",
  register: "/register",
  loginAs: "/login-as",
  emailVerify: "/api/auth/verify-email",
  emailVerificationSuccess: "/email-verification-success",
  emailVerificationError: "/email-verification-error",
  activeUsers: "/active-users",
  admins: "/admins",
  notifications: "/notifications",
  dashboard: "/dashboard",
  profile: "/profile",
  editProfile: "/edit-profile",
  oauthCallback: "/oauth-callback",
  sharedConversation: (token: string | ":token" = ":token") => `/p/${token}`,
} as const;
