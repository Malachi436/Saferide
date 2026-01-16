/**
 * LiquidGlassCard Component - School Bus Edition
 * Fun glassmorphism card with yellow tint and playful animations
 */

import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '../utils/helpers';
import { colors, shadows } from '../theme';

interface LiquidCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
  className?: string;
}

export const LiquidCard: React.FC<LiquidCardProps> = ({ 
  children, 
  intensity = 'medium',
  className,
  style,
  ...props 
}) => {
  const overlayOpacity = {
    light: 0.1,
    medium: 0.15,
    heavy: 0.25,
  }[intensity];

  return (
    <View 
      className={cn("rounded-3xl overflow-hidden", className)}
      style={[styles.container, style]}
      {...props}
    >
      {/* Blur background */}
      <BlurView intensity={20} style={StyleSheet.absoluteFill} />

      {/* Yellow-tinted overlay for school bus feel */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: `rgba(255, 212, 0, ${overlayOpacity})` },
        ]}
      />

      {/* Gradient stroke with yellow highlights */}
      <LinearGradient
        colors={["rgba(255, 212, 0, 0.4)", "rgba(255, 245, 224, 0.2)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...shadows.md,
    backgroundColor: "rgba(255, 248, 231, 0.6)",
  },
  gradientBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 212, 0, 0.3)",
  },
  content: {
    padding: 16,
    position: "relative",
    zIndex: 1,
  },
});
