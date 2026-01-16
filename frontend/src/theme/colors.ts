/**
 * SafeRide Color Palette - School Bus Theme
 * Fun, vibrant colors inspired by classic school buses
 */

export const colors = {
  // School Bus Primary Colors
  primary: {
    yellow: "#FFD400",
    darkYellow: "#F5BE00",
    black: "#1A1A1A",
  },

  // Accent Colors
  accent: {
    safetyOrange: "#FF6B35",
    chrome: "#C0C0C0",
    skyBlue: "#118AB2",
  },

  // Status Colors
  status: {
    success: "#06D6A0",
    warning: "#FFD400",
    danger: "#E63946",
    info: "#118AB2",
  },

  // Neutral Colors
  neutral: {
    warmCream: "#FFF8E7",
    pureWhite: "#FFFFFF",
    textPrimary: "#1A1A1A",
    textSecondary: "#525252",
    lightGray: "#F5F5F5",
    gray: "#A3A3A3",
  },

  // Fun Glass overlay with yellow tint
  glass: {
    overlay: "rgba(255, 212, 0, 0.15)",
    overlayLight: "rgba(255, 212, 0, 0.10)",
    overlayMedium: "rgba(255, 212, 0, 0.20)",
    overlayHeavy: "rgba(255, 212, 0, 0.30)",
  },
} as const;

export type Colors = typeof colors;
