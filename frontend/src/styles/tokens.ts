export const typography = {
  title: { xs: 18, md: 24, weight: 700 },
  section: { xs: 16, md: 18, weight: 700 },
  body: { size: 15, weight: 400 },
  caption: { size: 12, weight: 400 },
} as const;

export const colors = {
  primary: "#2950DA",
  textPrimary: "#222",
  textSecondary: "#666",
  surfaceMuted: "#F5F7FA",
} as const;

export const spacing = {
  pagePx: { xs: 2, md: 6 } as const,
  pagePy: { xs: 2, md: 4 } as const,
  sectionGap: { xs: 2, md: 4 } as const,
} as const;
