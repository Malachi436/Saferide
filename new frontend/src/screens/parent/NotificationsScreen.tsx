/**
 * Notifications Screen
 * View and manage notifications with filters
 */

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";

type NotificationType = "pickup" | "dropoff" | "delay" | "payment" | "general";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  childName?: string;
}

// Mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "pickup",
    title: "Child Picked Up",
    message: "Kwame has been picked up by the driver at 7:15 AM",
    timestamp: "2025-01-15T07:15:00",
    read: false,
    childName: "Kwame",
  },
  {
    id: "2",
    type: "delay",
    title: "Delay Alert",
    message: "Bus is running 5 minutes late due to traffic",
    timestamp: "2025-01-15T07:10:00",
    read: false,
  },
  {
    id: "3",
    type: "dropoff",
    title: "Child Dropped Off",
    message: "Kwame has been safely dropped off at school at 7:45 AM",
    timestamp: "2025-01-15T07:45:00",
    read: true,
    childName: "Kwame",
  },
  {
    id: "4",
    type: "payment",
    title: "Payment Received",
    message: "Your payment of GHS 200.00 has been received for January 2025",
    timestamp: "2025-01-14T16:30:00",
    read: true,
  },
  {
    id: "5",
    type: "general",
    title: "Route Update",
    message: "Your child's pickup time has been updated to 7:00 AM starting Monday",
    timestamp: "2025-01-13T12:00:00",
    read: true,
  },
  {
    id: "6",
    type: "pickup",
    title: "Child Picked Up",
    message: "Kwame has been picked up by the driver at 7:12 AM",
    timestamp: "2025-01-12T07:12:00",
    read: true,
    childName: "Kwame",
  },
  {
    id: "7",
    type: "dropoff",
    title: "Child Dropped Off",
    message: "Kwame has been safely dropped off at school at 7:42 AM",
    timestamp: "2025-01-12T07:42:00",
    read: true,
    childName: "Kwame",
  },
];

type FilterType = "all" | "pickup" | "dropoff" | "delay" | "payment";

export default function NotificationsScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (selectedFilter === "all") {
      return notifications;
    }
    return notifications.filter((n) => n.type === selectedFilter);
  }, [notifications, selectedFilter]);

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "pickup":
        return { name: "log-in" as const, color: colors.accent.safetyOrange };
      case "dropoff":
        return { name: "log-out" as const, color: colors.status.success };
      case "delay":
        return { name: "time" as const, color: colors.status.warning };
      case "payment":
        return { name: "card" as const, color: colors.accent.skyBlue };
      case "general":
        return { name: "information-circle" as const, color: colors.primary.yellow };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const filters: { key: FilterType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "all", label: "All", icon: "apps" },
    { key: "pickup", label: "Pickup", icon: "log-in" },
    { key: "dropoff", label: "Drop Off", icon: "log-out" },
    { key: "delay", label: "Delays", icon: "time" },
    { key: "payment", label: "Payment", icon: "card" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <Pressable onPress={handleMarkAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterScrollContent}
      >
        {filters.map((filter, index) => (
          <Animated.View
            key={filter.key}
            entering={FadeInDown.delay(100 + index * 50).springify()}
          >
            <Pressable
              onPress={() => setSelectedFilter(filter.key)}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.filterChipActive,
              ]}
            >
              <Ionicons
                name={filter.icon}
                size={18}
                color={
                  selectedFilter === filter.key
                    ? colors.primary.black
                    : colors.neutral.textPrimary
                }
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.yellow}
          />
        }
      >
        {filteredNotifications.length === 0 ? (
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.emptyState}
          >
            <View style={styles.emptyIcon}>
              <Ionicons
                name="notifications-off"
                size={48}
                color={colors.neutral.textSecondary}
              />
            </View>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === "all"
                ? "You are all caught up!"
                : `No ${selectedFilter} notifications`}
            </Text>
          </Animated.View>
        ) : (
          filteredNotifications.map((notification, index) => {
            const iconConfig = getNotificationIcon(notification.type);

            return (
              <Animated.View
                key={notification.id}
                entering={FadeInDown.delay(200 + index * 50).springify()}
              >
                <Pressable
                  onPress={() => {
                    if (!notification.read) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                  style={styles.notificationWrapper}
                >
                  <LiquidGlassCard
                    intensity={notification.read ? "light" : "medium"}
                    className="mb-3"
                  >
                    <View style={styles.notificationCard}>
                      {!notification.read && <View style={styles.unreadBadge} />}
                      <View
                        style={[
                          styles.notificationIcon,
                          { backgroundColor: iconConfig.color + "20" },
                        ]}
                      >
                        <Ionicons
                          name={iconConfig.name}
                          size={24}
                          color={iconConfig.color}
                        />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text
                          style={[
                            styles.notificationTitle,
                            !notification.read && styles.notificationTitleUnread,
                          ]}
                        >
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationMessage}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {formatTimestamp(notification.timestamp)}
                        </Text>
                      </View>
                    </View>
                  </LiquidGlassCard>
                </Pressable>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.warmCream,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary.yellow,
  },
  filterScroll: {
    maxHeight: 50,
    marginBottom: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.neutral.pureWhite,
    gap: 6,
    borderWidth: 2,
    borderColor: colors.neutral.gray,
  },
  filterChipActive: {
    backgroundColor: colors.primary.yellow,
    borderColor: colors.primary.black,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
  },
  filterChipTextActive: {
    color: colors.primary.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.neutral.textSecondary + "10",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.neutral.textSecondary,
    textAlign: "center",
  },
  notificationWrapper: {
    position: "relative",
  },
  notificationCard: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
    gap: 12,
  },
  unreadBadge: {
    position: "absolute",
    top: 20,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.yellow,
  },
  notificationIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary.black + "20",
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
  },
  notificationTitleUnread: {
    fontWeight: "800",
  },
  notificationMessage: {
    fontSize: 15,
    color: colors.primary.black,
    lineHeight: 21,
    fontWeight: "500",
  },
  notificationTime: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    marginTop: 4,
    fontWeight: "600",
  },
});
