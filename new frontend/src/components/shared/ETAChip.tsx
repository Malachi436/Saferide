/**
 * ETAChip Component - School Bus Edition
 * Display estimated time of arrival with bold styling
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";

interface ETAChipProps {
  minutes: number;
  variant?: "default" | "warning" | "success";
}

export function ETAChip({ minutes, variant = "default" }: ETAChipProps) {
  const variantConfig = {
    default: {
      bg: colors.status.info,
      text: colors.neutral.pureWhite,
      border: colors.primary.black
    },
    warning: {
      bg: colors.status.warning,
      text: colors.primary.black,
      border: colors.primary.black
    },
    success: {
      bg: colors.status.success,
      text: colors.neutral.pureWhite,
      border: colors.primary.black
    },
  };

  const config = variantConfig[variant];

  return (
    <View style={[styles.container, {
      backgroundColor: config.bg,
      borderColor: config.border
    }]}>
      <Ionicons name="time-outline" size={18} color={config.text} />
      <Text style={[styles.text, { color: config.text }]}>{minutes} min</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 5,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
