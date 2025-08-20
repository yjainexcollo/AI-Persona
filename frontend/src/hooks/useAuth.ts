import { useCallback } from "react";

/**
 * Simple authentication hook for webhook operations
 * Provides authentication token for API calls
 */
export const useAuth = () => {
  const getAuthToken = useCallback(async (): Promise<string> => {
    console.log("🔍 useAuth: Checking for token in localStorage...");
    const token = localStorage.getItem("token");
    console.log("🔍 useAuth: Token found:", token ? "Yes" : "No");

    if (!token) {
      console.error(
        "❌ useAuth: No authentication token found in localStorage"
      );
      throw new Error("No authentication token found. Please log in first.");
    }

    console.log("✅ useAuth: Token retrieved successfully");
    return token;
  }, []);

  return {
    getAuthToken,
  };
};
