/**
 * ROSAgo Theme
 * Central theme configuration
 */

export { colors } from "./colors";
export { spacing, borderRadius, shadows } from "./spacing";

export const theme = {
  colors: require("./colors").colors,
  spacing: require("./spacing").spacing,
  borderRadius: require("./spacing").borderRadius,
  shadows: require("./spacing").shadows,
} as const;

export type Theme = typeof theme;
