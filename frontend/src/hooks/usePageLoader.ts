/**
 * usePageLoader Custom Hook
 *
 * Manages global page loading states during navigation and component transitions.
 * Provides automatic loading indicators when routes change and manual control methods.
 *
 * Features:
 * - Automatic loading state on route changes
 * - Configurable loading duration
 * - Manual show/hide controls
 * - Cleanup on component unmount
 */

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook for managing page loading states
 *
 * @returns {Object} Loading state and control functions
 * @returns {boolean} isLoading - Current loading state
 * @returns {Function} hideLoader - Function to manually hide the loader
 * @returns {Function} showLoader - Function to manually show the loader
 */
export const usePageLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);

    // Use a short delay and then schedule immediate hide after paint
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Ensure we don't keep it longer than necessary
      queueMicrotask(() => setIsLoading(false));
    }, 200); // 200ms to avoid flicker

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname]);

  const hideLoader = () => setIsLoading(false);
  const showLoader = () => setIsLoading(true);

  return { isLoading, hideLoader, showLoader };
};
