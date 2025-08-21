/**
 * Authentication Service
 *
 * Provides centralized authentication functionality including login, logout, and token management.
 */

import { fetchWithAuth } from "../utils/session";
import { env } from "@/lib/config/env";
import { storage } from "@/lib/storage/localStorage";

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
      const response = await fetch(`${env.backendUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

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
