// Color Palette - Liquid Glass Design System
export const colors = {
  // Primary
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',

  // Background
  background: '#FDFDFD',
  cream: '#F8F8F8',
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Glass Effect
  glassWhite: 'rgba(255, 255, 255, 0.9)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
};

// Status-specific colors
export const statusColors = {
  waiting: colors.gray[400],
  picked_up: colors.success,
  on_board: colors.info,
  dropped_off: colors.primary,
  absent: colors.danger,
};

// Layout constants
export const layout = {
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border Radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  // Container
  container: {
    padding: 16,
    maxWidth: 1200,
  },

  // Card
  card: {
    padding: 16,
    borderRadius: 16,
  },

  // Button
  button: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 24,
  },

  // Input
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
};

// Typography
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};
