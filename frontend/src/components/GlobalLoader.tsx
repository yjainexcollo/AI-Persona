/**
 * Global Loader Component
 * 
 * A full-screen loading overlay that displays during application loading states.
 * Uses Material-UI Backdrop with a centered circular progress indicator and message.
 * 
 * Features:
 * - Full-screen overlay with semi-transparent background
 * - Centered circular progress indicator
 * - Customizable loading message
 * - High z-index to appear above all other content
 */

import React from 'react';
import { Backdrop, CircularProgress, Box, Typography } from '@mui/material';

/**
 * Props interface for the GlobalLoader component
 */
interface GlobalLoaderProps {
  /** Whether the loader should be visible */
  open: boolean;
  /** Optional message to display below the spinner */
  message?: string;
}

/**
 * Global Loader Component
 * 
 * Renders a full-screen loading overlay with a circular progress indicator
 * and optional message. Used for global application loading states.
 */
const GlobalLoader: React.FC<GlobalLoaderProps> = ({ open, message = "Loading..." }) => {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      open={open}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* Circular progress indicator with custom styling */}
        <CircularProgress 
          color="primary" 
          size={60}
          thickness={4}
          sx={{
            color: '#0A9969',
          }}
        />
        {/* Loading message text */}
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#fff',
            fontWeight: 500,
            fontSize: '18px',
          }}
        >
          {message}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default GlobalLoader; 