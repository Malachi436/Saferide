/**
 * ROSAgo Color Palette
 * Exact color specifications for the premium school-transport app
 */

export const colors = {
  // Primary Colors
  primary: {
    blue: "#2A7FF4",
    teal: "#1BA7A1",
  },

  // Accent Colors
  accent: {
    sunsetOrange: "#FF8A3D",
    successGreen: "#23C552",
    plantainGreen: "#4BB543",
  },

  // Status Colors
  status: {
    infoBlue: "#4DAAFF",
    warningYellow: "#FFCC00",
    dangerRed: "#E53935",
  },

  // Neutral Colors
  neutral: {
    creamWhite: "#FAF7F2",
    pureWhite: "#FFFFFF",
    textPrimary: "#1D1D1F",
    textSecondary: "#6E6E6E",
  },

  // Liquid Glass overlay
  glass: {
    overlay: "rgba(255, 255, 255, 0.25)",
    overlayLight: "rgba(255, 255, 255, 0.20)",
    overlayMedium: "rgba(255, 255, 255, 0.30)",
    overlayHeavy: "rgba(255, 255, 255, 0.35)",
  },
} as const;

export type Colors = typeof colors;
