/**
 * Authentication Service
 *
 * Provides centralized authentication functionality including login, logout, and token management.
 */

import { fetchWithAuth } from "../utils/session";
import { env } from "@/lib/config/env";
import { storage } from "@/lib/storage/localStorage";
import { stopProactiveTokenRefresh } from "../utils/session";

/**
 * Logout the current user
 *
 * Calls the backend logout endpoint to invalidate the session,
 * then clears local storage and redirects to login page.
 *
 * @returns Promise that resolves when logout is complete
 */
export async function logout(): Promise<void> {
  try {
    const accessToken = storage.getToken();

    if (accessToken) {
      // Call backend logout endpoint with access token in Authorization header
      const response = await fetchWithAuth(
        `${env.backendUrl}/api/auth/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Log the response for debugging (optional)
      if (!response.ok) {
        console.warn(
          "Backend logout failed, but proceeding with local cleanup"
        );
      }
    }
  } catch (error) {
    // Even if backend call fails, proceed with local cleanup
    console.warn("Logout error:", error);
  } finally {
    // Stop proactive token refresh
    stopProactiveTokenRefresh();

    // Always clear local storage and redirect
    storage.clearAll();
    window.location.href = "/login";
  }
}

/**
 * Check if user is authenticated
 *
 * @returns boolean indicating if user has valid authentication
 */
export function isAuthenticated(): boolean {
  const token = storage.getToken();
  const user = storage.getUser();
  return !!(token && user);
}

/**
 * Get current user data
 *
 * @returns User object or null if not authenticated
 */
export function getCurrentUser(): any {
  return storage.getUser();
}

/**
 * Refresh current user data from backend
 *
 * @returns Promise that resolves with updated user data
 */
export async function refreshCurrentUser(): Promise<any> {
  try {
    const response = await fetchWithAuth(`${env.backendUrl}/api/users/me`);

    if (!response.ok) {
      throw new Error("Failed to refresh user data");
    }

    const data = await response.json();
    const userData = data.data.user;

    // Update localStorage with fresh user data
    storage.setUser(userData);

    return userData;
  } catch (error) {
    console.error("Failed to refresh user data:", error);
    throw error;
  }
}

/**
 * Verify email with token
 *
 * @param token - The verification token from email
 * @returns Promise that resolves with verification result
 */
export async function verifyEmail(token: string): Promise<any> {
  try {
    const response = await fetch(
      `${env.backendUrl}/api/auth/verify-email?token=${token}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Verification failed");
    }

    return data;
  } catch (error) {
    console.error("Email verification error:", error);
    throw error;
  }
}
