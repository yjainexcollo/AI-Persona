/**
 * Authentication Service
 * 
 * Provides centralized authentication functionality including login, logout, and token management.
 */

import { fetchWithAuth } from '../utils/session';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

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
    // Get access token from localStorage
    const accessToken = localStorage.getItem('token');
    
    if (accessToken) {
      // Call backend logout endpoint with access token in Authorization header
      const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      // Log the response for debugging (optional)
      if (!response.ok) {
        console.warn('Backend logout failed, but proceeding with local cleanup');
      }
    }
  } catch (error) {
    // Even if backend call fails, proceed with local cleanup
    console.warn('Logout error:', error);
  } finally {
    // Always clear local storage and redirect
    localStorage.clear();
    window.location.href = '/login';
  }
}

/**
 * Check if user is authenticated
 * 
 * @returns boolean indicating if user has valid authentication
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
}

/**
 * Get current user data
 * 
 * @returns User object or null if not authenticated
 */
export function getCurrentUser(): any {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Verify email with token
 * 
 * @param token - The verification token from email
 * @returns Promise that resolves with verification result
 */
export async function verifyEmail(token: string): Promise<any> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/verify-email?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Verification failed');
    }

    return data;
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
} 