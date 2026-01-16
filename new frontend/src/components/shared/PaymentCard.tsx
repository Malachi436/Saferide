/**
 * PaymentCard Component
 * Display payment method selection and information
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PaymentMethod } from "../../types/models";
import { colors } from "../../theme";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";

interface PaymentCardProps {
  method: PaymentMethod;
  selected?: boolean;
  onPress?: () => void;
}

export function PaymentCard({ method, selected = false, onPress }: PaymentCardProps) {
  const methodConfig = {
    momo: {
      icon: "phone-portrait",
      title: "Mobile Money",
      subtitle: "Pay with MTN, Vodafone, or AirtelTigo",
      color: colors.primary.yellow,
    },
    cash: {
      icon: "cash",
      title: "Cash",
      subtitle: "Pay driver directly",
      color: colors.status.success,
    },
  };

  const config = methodConfig[method];

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <LiquidGlassCard
        className="mb-3"
        intensity={selected ? "heavy" : "medium"}
        style={selected ? styles.selected : undefined}
      >
        <View style={styles.container}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
            <Ionicons name={config.icon as any} size={24} color={colors.neutral.pureWhite} />
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.subtitle}>{config.subtitle}</Text>
          </View>

          {/* Selected indicator */}
          {selected && (
            <Ionicons name="checkmark-circle" size={24} color={colors.status.success} />
          )}
        </View>
      </LiquidGlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.status.success,
  },
});
