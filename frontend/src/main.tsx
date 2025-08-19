/**
 * Main entry point for the AI-Persona Frontend Application
 * 
 * This file initializes the React application with Material-UI theming,
 * CSS baseline reset, and renders the root App component.
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.tsx'

// Initialize Material-UI theme configuration
// Note: Currently using default theme, can be customized as needed
const theme = createTheme({

})

// Create and render the React application root
// Uses React 18's createRoot API for concurrent features
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
