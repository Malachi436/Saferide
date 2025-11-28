/**
 * LargeCTAButton Component
 * Primary action button with press animations
 */

import React from "react";
import { Text, Pressable, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../theme";

interface LargeCTAButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "success" | "danger";
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

export function LargeCTAButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}: LargeCTAButtonProps) {
  const backgroundColor = {
    primary: colors.primary.blue,
    secondary: colors.primary.teal,
    success: colors.accent.successGreen,
    danger: colors.status.dangerRed,
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    color: colors.neutral.pureWhite,
    fontSize: 18,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});