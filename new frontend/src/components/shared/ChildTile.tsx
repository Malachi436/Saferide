/**
 * ChildTile Component - School Bus Edition
 * Fun, bouncy display of child information with playful animations
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Child } from "../../types/models";
import { colors } from "../../theme";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ChildTileProps {
  child: Child;
  onPress?: () => void;
  showStatus?: boolean;
}

export function ChildTile({ child, onPress, showStatus = true }: ChildTileProps) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const statusConfig = {
    waiting: { icon: "time-outline", color: colors.accent.safetyOrange, label: "Waiting" },
    picked_up: { icon: "checkmark-circle", color: colors.status.success, label: "Picked Up" },
    on_way: { icon: "car-outline", color: colors.status.info, label: "On the way" },
    arrived: { icon: "location", color: colors.status.success, label: "Arrived" },
    dropped_off: { icon: "checkmark-done-circle", color: colors.status.success, label: "Dropped Off" },
  };

  const status = statusConfig[child.status];

  const initials = child.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 12 });
    rotate.value = withSpring(-1, { damping: 12 });
  };

  const handlePressOut = () => {
    scale.value = withSequence(
      withSpring(1.03, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
    rotate.value = withSequence(
      withSpring(1, { damping: 8 }),
      withSpring(0, { damping: 10 })
    );
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
      style={animatedStyle}
    >
      <LiquidGlassCard className="mb-3" animated={false}>
        <View style={styles.container}>
          {/* Avatar with Initials - School bus colors */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{child.name}</Text>
            <Text style={styles.pickupType}>
              {child.pickupType === "home" ? "Home Pickup" : "Roadside Pickup"}
            </Text>
            {child.pickupLocation.address && (
              <Text style={styles.address} numberOfLines={1}>
                {child.pickupLocation.address}
              </Text>
            )}
          </View>

          {/* Status */}
          {showStatus && (
            <View style={styles.statusContainer}>
              <Ionicons name={status.icon as any} size={24} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          )}
        </View>
      </LiquidGlassCard>
    </AnimatedPressable>
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
    backgroundColor: colors.primary.yellow,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.primary.black,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary.black,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 3,
  },
  pickupType: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    marginBottom: 2,
    fontWeight: "600",
  },
  address: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
  },
  statusContainer: {
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: colors.neutral.pureWhite,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary.black + "20",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
});
