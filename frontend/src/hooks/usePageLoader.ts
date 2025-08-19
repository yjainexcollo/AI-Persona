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

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook for managing page loading states
 * 
 * @returns {Object} Loading state and control functions
 * @returns {boolean} isLoading - Current loading state
 * @returns {Function} hideLoader - Function to manually hide the loader
 * @returns {Function} showLoader - Function to manually show the loader
 */
export const usePageLoader = () => {
  // State to track loading status
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show loader when location changes
    setIsLoading(true);
    
    // Hide loader after a short delay to provide visual feedback
    // This prevents flickering on fast page loads while ensuring
    // users see the loading state for slower transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 second delay

    // Cleanup timer if component unmounts or location changes again
    // This prevents memory leaks and ensures proper state management
    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname]); // Trigger when pathname changes

  /**
   * Manually hide the loader
   * Useful for faster page loads where the automatic timer is too slow
   */
  const hideLoader = () => {
    setIsLoading(false);
  };

  /**
   * Manually show the loader
   * Useful for custom loading scenarios or long-running operations
   */
  const showLoader = () => {
    setIsLoading(true);
  };

  return {
    isLoading,
    hideLoader,
    showLoader,
  };
}; 