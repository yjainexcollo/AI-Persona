/**
 * Vite Configuration
 *
 * Build tool configuration for the AI-Persona Frontend application.
 * Uses Vite for fast development and optimized production builds.
 *
 * Features:
 * - React plugin for JSX/TSX support
 * - Hot module replacement for development
 * - Optimized builds for production
 * - TypeScript support
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
