/**
 * Notifications Screen
 * View and manage notifications with filters
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { apiClient } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";
import { Notification as NotificationModel } from "../../types";

type NotificationType = "PICKUP" | "DROPOFF" | "DELAY" | "PAYMENT" | "INFO";
type DisplayNotificationType = "pickup" | "dropoff" | "delay" | "payment" | "general";

interface NotificationDisplay extends NotificationModel {
  displayType: DisplayNotificationType;
}

type FilterType = "all" | "pickup" | "dropoff" | "delay" | "payment";

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<NotificationModel[]>(
        `/notifications/user/${user.id}`
      );
      console.log('[NotificationsScreen] Fetched notifications:', response);

      // Map backend notifications to display format
      const displayNotifications: NotificationDisplay[] = (Array.isArray(response) ? response : []).map((notif) => ({
        ...notif,
        displayType: mapNotificationType(notif.type),
      }));

      setNotifications(displayNotifications);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to load notifications';
      setError(errorMsg);
      console.error('[NotificationsScreen] Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  // Map backend notification types to display types
  const mapNotificationType = (type: NotificationType): NotificationDisplay['displayType'] => {
    const typeMap: Record<NotificationType, NotificationDisplay['displayType']> = {
      'PICKUP': 'pickup',
      'DROPOFF': 'dropoff',
      'DELAY': 'delay',
      'PAYMENT': 'payment',
      'INFO': 'general',
    };
    return typeMap[type] || 'general';
  };

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (selectedFilter === "all") {
      return notifications;
    }
    return notifications.filter((n) => n.displayType === selectedFilter);
  }, [notifications, selectedFilter]);

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getNotificationIcon = (displayType: DisplayNotificationType) => {
    switch (displayType) {
      case "pickup":
        return { name: "log-in" as const, color: colors.accent.safetyOrange };
      case "dropoff":
        return { name: "log-out" as const, color: colors.status.success };
      case "delay":
        return { name: "time" as const, color: colors.status.warning };
      case "payment":
        return { name: "card" as const, color: colors.accent.safetyOrange };
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
                    ? colors.neutral.pureWhite
                    : colors.neutral.textSecondary
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
            const iconConfig = getNotificationIcon(notification.displayType);
            const isChildStatus = notification.displayType === 'pickup' || notification.displayType === 'dropoff';
            const statusColor = notification.displayType === 'pickup' 
              ? colors.accent.safetyOrange 
              : notification.displayType === 'dropoff' 
                ? colors.status.success 
                : colors.primary.yellow;
            const statusLabel = notification.displayType === 'pickup' 
              ? 'Picked Up' 
              : notification.displayType === 'dropoff' 
                ? 'Dropped Off' 
                : null;

            return (
              <Animated.View
                key={notification.id}
                entering={FadeInDown.delay(200 + index * 50).springify()}
                style={styles.bannerWrapper}
              >
                <Pressable
                  onPress={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                  style={styles.notificationWrapper}
                >
                  {isChildStatus ? (
                    // Banner-style notification for child status
                    <View style={[styles.bannerCard, { borderLeftColor: statusColor }]}>
                      {!notification.isRead && <View style={styles.unreadDot} />}
                      <View style={styles.bannerHeader}>
                        <View
                          style={[
                            styles.bannerIcon,
                            { backgroundColor: statusColor + "15" },
                          ]}
                        >
                          <Ionicons
                            name={iconConfig.name}
                            size={28}
                            color={statusColor}
                          />
                        </View>
                        <View style={styles.bannerTitleContainer}>
                          <Text style={styles.bannerTitle}>{notification.title}</Text>
                          <Text style={styles.bannerTime}>
                            {formatTimestamp(notification.createdAt)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.bannerBody}>
                        <Text style={styles.bannerMessage}>{notification.message}</Text>
                        {statusLabel && (
                          <View style={[styles.statusChip, { backgroundColor: statusColor + "15" }]}>
                            <Ionicons
                              name={notification.displayType === 'pickup' ? 'arrow-up-circle' : 'checkmark-circle'}
                              size={16}
                              color={statusColor}
                            />
                            <Text style={[styles.statusChipText, { color: statusColor }]}>
                              Status: {statusLabel}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ) : (
                    // Regular notification card for other types
                    <LiquidGlassCard
                      intensity={notification.isRead ? "light" : "medium"}
                      className="mb-3"
                    >
                      <View style={styles.notificationCard}>
                        {!notification.isRead && <View style={styles.unreadBadge} />}
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
                              !notification.isRead && styles.notificationTitleUnread,
                            ]}
                          >
                            {notification.title}
                          </Text>
                          <Text style={styles.notificationMessage}>
                            {notification.message}
                          </Text>
                          <Text style={styles.notificationTime}>
                            {formatTimestamp(notification.createdAt)}
                          </Text>
                        </View>
                      </View>
                    </LiquidGlassCard>
                  )}
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
    borderWidth: 1,
    borderColor: colors.neutral.textSecondary + "20",
  },
  filterChipActive: {
    backgroundColor: colors.primary.yellow,
    borderColor: colors.primary.yellow,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral.textSecondary,
  },
  filterChipTextActive: {
    color: colors.neutral.pureWhite,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  notificationTitleUnread: {
    fontWeight: "700",
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
    marginTop: 4,
  },
  // Banner-style notification styles
  bannerWrapper: {
    marginBottom: 12,
  },
  bannerCard: {
    backgroundColor: colors.neutral.pureWhite,
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  bannerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitleContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 2,
  },
  bannerTime: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
  },
  bannerBody: {
    gap: 10,
  },
  bannerMessage: {
    fontSize: 15,
    color: colors.neutral.textSecondary,
    lineHeight: 22,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  unreadDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.yellow,
  },
});
