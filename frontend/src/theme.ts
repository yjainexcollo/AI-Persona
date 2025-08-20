import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    surface: {
      0: string;
      50: string;
      100: string;
    };
  }
  interface PaletteOptions {
    surface?: {
      0: string;
      50: string;
      100: string;
    };
  }
}

const prefersDark =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const mode: "light" | "dark" =
  (localStorage.getItem("themeMode") as "light" | "dark") ||
  (prefersDark ? "dark" : "light");

const tokens = {
  primary: { main: "#2950DA", light: "#E8ECF2", dark: "#526794" },
  secondary: { main: "#526794" },
} as const;

const base = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
    h2: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
    h3: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
    h4: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
    h5: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
    h6: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
    body1: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    body2: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    button: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    caption: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    overline: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      },
    },
  },
} as const;

const light = createTheme({
  palette: {
    mode: "light",
    primary: tokens.primary,
    secondary: tokens.secondary,
    background: { default: "#ffffff", paper: "#ffffff" },
    surface: { 0: "#ffffff", 50: "#f9fafb", 100: "#f3f4f6" },
  },
  ...base,
});

const dark = createTheme({
  palette: {
    mode: "dark",
    primary: tokens.primary,
    secondary: tokens.secondary,
    background: { default: "#0b0e14", paper: "#0f131a" },
    surface: { 0: "#0f131a", 50: "#141924", 100: "#1a2130" },
  },
  ...base,
});

export default mode === "dark" ? dark : light;
