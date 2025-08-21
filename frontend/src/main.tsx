/**
 * Main entry point for the AI-Persona Frontend Application
 *
 * This file initializes the React application with Material-UI theming,
 * CSS baseline reset, and renders the root App component.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.css";
import AppRoot from "@/app/AppRoot";
import theme from "./theme";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoot />
    </ThemeProvider>
  </React.StrictMode>
);
