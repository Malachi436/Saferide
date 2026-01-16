/**
 * DriverInfoBanner Component - School Bus Edition
 * Display driver information with bold styling and better contrast
 */

import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Driver } from "../../types/models";
import { colors } from "../../theme";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import * as Haptics from "expo-haptics";

interface DriverInfoBannerProps {
  driver: Driver;
  busPlateNumber?: string;
}

export function DriverInfoBanner({ driver, busPlateNumber }: DriverInfoBannerProps) {
  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement phone call functionality
  };

  return (
    <LiquidGlassCard>
      <View style={styles.container}>
        {/* Avatar with bold border */}
        <View style={styles.avatarContainer}>
          {driver.avatar ? (
            <Image source={{ uri: driver.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={32} color={colors.primary.black} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>YOUR DRIVER</Text>
          <Text style={styles.name}>{driver.name}</Text>
          {busPlateNumber && <Text style={styles.busNumber}>🚌 {busPlateNumber}</Text>}
        </View>

        {/* Call button with bouncy feel */}
        <Pressable onPress={handleCall} style={styles.callButton}>
          <Ionicons name="call" size={22} color={colors.neutral.pureWhite} />
        </Pressable>
      </View>
    </LiquidGlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.primary.yellow,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary.yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContainer: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: colors.neutral.textSecondary,
    marginBottom: 3,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.neutral.textPrimary,
    marginBottom: 3,
  },
  busNumber: {
    fontSize: 14,
    color: colors.primary.black,
    fontWeight: "700",
  },
  callButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.status.success,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: colors.primary.black,
  },
});
