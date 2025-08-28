/**
 * Environment configuration helpers
 */

export const env = (() => {
  const url = (import.meta as any).env?.VITE_BACKEND_URL;
  if (!url || typeof url !== "string" || url.trim() === "") {
    throw new Error("VITE_BACKEND_URL is required (set in your env)");
  }
  return { BACKEND_URL: url } as const;
})();
