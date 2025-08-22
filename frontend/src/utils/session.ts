/**
 * Session Management Utilities
 *
 * Provides utilities for managing chat sessions and authentication tokens.
 * Includes functions for session ID generation, token refresh, and authenticated API calls.
 */

import { v4 as uuidv4 } from "uuid";
import { env } from "@/lib/config/env";
import { storage } from "@/lib/storage/localStorage";

// Track ongoing refresh operations to prevent multiple simultaneous refreshes
let refreshPromise: Promise<string> | null = null;
let refreshInterval: NodeJS.Timeout | null = null;

/**
 * Start proactive token refresh
 *
 * Sets up a timer to refresh the access token before it expires.
 * This prevents users from being logged out due to expired tokens.
 */
export function startProactiveTokenRefresh() {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Refresh token every 23 hours (access tokens expire in 24 hours)
  // This gives us a 1-hour buffer before expiration
  refreshInterval = setInterval(async () => {
    try {
      const token = storage.getToken();
      const refreshTokenValue = storage.getRefreshToken();

      if (token && refreshTokenValue) {
        console.log("🔄 Proactively refreshing access token...");
        await refreshToken();
      }
    } catch (error) {
      console.warn("Proactive token refresh failed:", error);
      // Don't redirect on proactive refresh failure
      // Let the next API call handle it
    }
  }, 23 * 60 * 60 * 1000); // 23 hours
}

/**
 * Stop proactive token refresh
 */
export function stopProactiveTokenRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

/**
 * Check if proactive token refresh should be started
 *
 * This function checks if we have valid tokens and starts proactive refresh if needed.
 * Call this when the app initializes to ensure token refresh is running.
 */
export function initializeTokenRefresh() {
  const token = storage.getToken();
  const refreshTokenValue = storage.getRefreshToken();

  if (token && refreshTokenValue) {
    console.log("🔑 Valid tokens found, starting proactive refresh...");
    startProactiveTokenRefresh();
  }
}

/**
 * Get or create a session ID for a specific persona
 *
 * Retrieves an existing session ID from localStorage, or creates a new one
 * if none exists. Each persona has its own unique session ID.
 *
 * @param personaId - The ID of the persona for which to get/create session
 * @returns The session ID string
 */
export function getSessionId(personaId: string): string {
  const key = `chat_session_id_${personaId}`;
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
}

/**
 * Start a new session for a specific persona
 *
 * Creates a new session ID and stores it in localStorage, replacing any
 * existing session for the given persona.
 *
 * @param personaId - The ID of the persona for which to start a new session
 * @returns The new session ID string
 */
export function startNewSession(personaId: string): string {
  const sessionId = uuidv4();
  const key = `chat_session_id_${personaId}`;
  localStorage.setItem(key, sessionId);
  return sessionId;
}

/**
 * Refresh the authentication token
 *
 * Makes a request to the backend to refresh the current authentication token.
 * Uses httpOnly cookies for secure token storage when available.
 * Prevents multiple simultaneous refresh operations.
 *
 * @returns Promise that resolves to the new token string
 * @throws Error if token refresh fails
 */
export async function refreshToken() {
  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  // Start new refresh operation
  refreshPromise = (async () => {
    try {
      const backendUrl = env.backendUrl;
      const refreshToken = storage.getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      console.log("🔄 Attempting to refresh access token...");

      const response = await fetch(`${backendUrl}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Token refresh failed:", response.status, errorText);
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      if (data.data && data.data.accessToken) {
        storage.setToken(data.data.accessToken);
        if (data.data.refreshToken) {
          storage.setRefreshToken(data.data.refreshToken);
        }
        console.log("✅ Token refreshed successfully");
        return data.data.accessToken;
      }
      throw new Error("No token returned");
    } finally {
      // Clear the promise reference
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Fetch with automatic token refresh
 *
 * Wraps the native fetch function with automatic token refresh capabilities.
 * If a request returns 401 (Unauthorized), it automatically attempts to
 * refresh the token and retry the request.
 *
 * Features:
 * - Automatic token inclusion in Authorization header
 * - Workspace ID inclusion in headers when available
 * - Automatic token refresh on 401 responses
 * - Redirect to login on refresh failure
 * - Prevents multiple simultaneous refresh operations
 *
 * @param url - The URL to fetch from
 * @param options - Fetch options (headers, method, body, etc.)
 * @returns Promise that resolves to the fetch Response
 * @throws Error if the request fails after token refresh
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get current token and workspace ID
  let token = storage.getToken();
  const workspaceId = storage.getWorkspaceId();

  // Prepare headers with authentication and workspace context
  let headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
    Authorization: `Bearer ${token}`,
  };

  if (workspaceId) {
    headers["x-workspace-id"] = workspaceId;
  }

  // Make initial request
  let response = await fetch(url, { ...options, headers });

  // If unauthorized, try to refresh token and retry
  if (response.status === 401) {
    try {
      console.log("🔄 Received 401, attempting token refresh...");
      token = await refreshToken();
      headers = { ...(headers || {}), Authorization: `Bearer ${token}` };
      if (workspaceId) {
        headers["x-workspace-id"] = workspaceId;
      }
      response = await fetch(url, { ...options, headers });
      console.log("✅ Request retried with new token");
    } catch (err) {
      console.error("❌ Token refresh failed, redirecting to login");
      // If refresh fails, clear all tokens and redirect to login
      storage.clearAll();
      window.location.href = "/login";
      throw err;
    }
  }

  // Also handle 500 errors that contain authentication issues
  if (response.status === 500) {
    try {
      // Clone the response so we can read it without consuming the body
      const responseClone = response.clone();
      const errorText = await responseClone.text();
      const errorData = JSON.parse(errorText);

      // Check if the error is related to authentication
      if (
        errorData.error &&
        errorData.error.message &&
        (errorData.error.message.includes("Invalid or expired access token") ||
          errorData.error.message.includes("Invalid or expired token"))
      ) {
        try {
          console.log(
            "🔄 Received 500 with auth error, attempting token refresh..."
          );
          token = await refreshToken();
          headers = { ...(headers || {}), Authorization: `Bearer ${token}` };
          if (workspaceId) {
            headers["x-workspace-id"] = workspaceId;
          }
          response = await fetch(url, { ...options, headers });
          console.log("✅ Request retried with new token after 500 auth error");
        } catch (err) {
          console.error(
            "❌ Token refresh failed after 500 auth error, redirecting to login"
          );
          // If refresh fails, clear all tokens and redirect to login
          storage.clearAll();
          window.location.href = "/login";
          throw err;
        }
      }
    } catch (parseErr) {
      // If we can't parse the error, just return the original response
      console.warn("Could not parse error response:", parseErr);
    }
  }

  return response;
}
