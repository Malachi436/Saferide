/**
 * NotificationItem Component
 * Display a notification with icon and timestamp
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Notification } from "../../types/models";
import { colors } from "../../theme";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { format } from "date-fns";

interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const iconConfig = {
    pickup: { name: "car", color: colors.status.info },
    drop: { name: "location", color: colors.status.success },
    delay: { name: "time", color: colors.status.warning },
    payment: { name: "cash", color: colors.accent.safetyOrange },
    general: { name: "notifications", color: colors.primary.yellow },
  };

  const config = iconConfig[notification.type];

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <LiquidGlassCard className="mb-3" intensity={notification.read ? "light" : "medium"}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
            <Ionicons name={config.name as any} size={20} color={colors.neutral.pureWhite} />
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{notification.title}</Text>
              {!notification.read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.message}>{notification.message}</Text>
            <Text style={styles.timestamp}>
              {format(new Date(notification.date), "MMM d, h:mm a")}
            </Text>
          </View>
        </View>
      </LiquidGlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.yellow,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
  },
});
