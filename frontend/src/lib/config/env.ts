/**
 * Environment configuration helpers
 */

export const env = {
  backendUrl:
    (import.meta as any).env?.VITE_BACKEND_URL ?? "http://localhost:3000",
  isDev: (import.meta as any).env?.DEV ?? false,
};
