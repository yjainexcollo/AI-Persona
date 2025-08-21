/**
 * Session Management Utilities
 *
 * Provides utilities for managing chat sessions and authentication tokens.
 * Includes functions for session ID generation, token refresh, and authenticated API calls.
 */

import { v4 as uuidv4 } from "uuid";
import { env } from "@/lib/config/env";
import { storage } from "@/lib/storage/localStorage";

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
 *
 * @returns Promise that resolves to the new token string
 * @throws Error if token refresh fails
 */
export async function refreshToken() {
  const backendUrl = env.backendUrl;
  const refreshToken = storage.getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${backendUrl}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const data = await response.json();
  if (data.data && data.data.accessToken) {
    storage.setToken(data.data.accessToken);
    if (data.data.refreshToken) {
      storage.setRefreshToken(data.data.refreshToken);
    }
    return data.data.accessToken;
  }
  throw new Error("No token returned");
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
      token = await refreshToken();
      headers = { ...(headers || {}), Authorization: `Bearer ${token}` };
      if (workspaceId) {
        headers["x-workspace-id"] = workspaceId;
      }
      response = await fetch(url, { ...options, headers });
    } catch (err) {
      // If refresh fails, clear token and redirect to login
      storage.removeToken();
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
          token = await refreshToken();
          headers = { ...(headers || {}), Authorization: `Bearer ${token}` };
          if (workspaceId) {
            headers["x-workspace-id"] = workspaceId;
          }
          response = await fetch(url, { ...options, headers });
        } catch (err) {
          // If refresh fails, clear token and redirect to login
          storage.removeToken();
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
