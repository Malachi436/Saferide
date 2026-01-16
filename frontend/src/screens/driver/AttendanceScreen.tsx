/**
 * Attendance Screen
 * Shows attendance summary with total children, picked up, and dropped off
 */

import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlowingOrb } from "../../components/ui/GlowingOrb";
import { useAuthStore } from "../../stores/authStore";
import { apiClient } from "../../utils/api";
import { socketService } from "../../utils/socket";
import { DriverStackParamList } from "../../navigation/DriverNavigator";

type NavigationProp = NativeStackNavigationProp<DriverStackParamList>;

export default function AttendanceScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayTrip = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) return;

      const response = await apiClient.get<any>(`/drivers/${user.id}/today-trip`);
      setTrip(response);
    } catch (err: any) {
      console.log('[AttendanceScreen] Error fetching trip:', err);
      setError(err.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  // Connect to WebSocket and subscribe to notifications
  useEffect(() => {
    const setupWebSocket = async () => {
      await socketService.connect();

      // Listen for parent pickup requests
      const handleParentPickup = (data: any) => {
        console.log('[AttendanceScreen] Parent pickup requested:', data);
        Alert.alert(
          'Parent Pickup Request',
          `${data.parentName} will pick up ${data.childName} in the ${data.timeOfDay.toLowerCase()}.\n\n${data.reason || ''}`,
          [
            {
              text: 'OK',
              onPress: () => fetchTodayTrip(), // Refresh data
            },
          ]
        );
      };

      // Listen for trip skip requests
      const handleTripSkip = (data: any) => {
        console.log('[AttendanceScreen] Trip skip requested:', data);
        Alert.alert(
          'Child Skipping Trip',
          `${data.childName} will not join the bus today.\n\n${data.reason || ''}`,
          [
            {
              text: 'OK',
              onPress: () => fetchTodayTrip(), // Refresh data
            },
          ]
        );
      };

      socketService.on('parent_pickup_requested', handleParentPickup);
      socketService.on('trip_skip_requested', handleTripSkip);

      // Subscribe to trip tracking room if we have a trip
      if (trip?.id) {
        socketService.subscribeToTrip(trip.id);
      }

      return () => {
        socketService.off('parent_pickup_requested', handleParentPickup);
        socketService.off('trip_skip_requested', handleTripSkip);
        if (trip?.id) {
          socketService.unsubscribeFromTrip(trip.id);
        }
      };
    };

    setupWebSocket();
  }, [trip?.id]);

  useFocusEffect(
    React.useCallback(() => {
      fetchTodayTrip();
    }, [user?.id])
  );

  const childrenOnTrip = trip?.attendances || [];

  // Calculate stats from attendance records
  const stats = useMemo(() => {
    const total = childrenOnTrip.length;
    const pickedUp = childrenOnTrip.filter(
      (a: any) => a.status === 'PICKED_UP'
    ).length;
    const droppedOff = childrenOnTrip.filter(
      (a: any) => a.status === 'DROPPED'
    ).length;

    return { total, pickedUp, droppedOff };
  }, [childrenOnTrip]);

  // Calculate percentages for visual progress
  const pickedUpPercentage = stats.total > 0 ? (stats.pickedUp / stats.total) * 100 : 0;
  const droppedOffPercentage = stats.total > 0 ? (stats.droppedOff / stats.total) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[colors.primary.yellow, colors.primary.darkYellow, colors.accent.safetyOrange]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />

      {/* Floating Glowing Orbs */}
      <GlowingOrb size={150} color="rgba(255, 255, 255, 0.6)" delay={0} duration={11000} startX={-30} startY={20} />
      <GlowingOrb size={120} color="rgba(255, 220, 100, 0.65)" delay={2000} duration={13000} startX={200} startY={50} />
      <GlowingOrb size={100} color="rgba(255, 150, 80, 0.55)" delay={4000} duration={14000} startX={100} startY={80} />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.neutral.pureWhite} />
          </Pressable>
          <Text style={styles.headerTitle}>Attendance</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.yellow} />
              <Text style={styles.loadingText}>Loading attendance...</Text>
            </View>
          )}

          {error && !loading && (
            <View style={styles.errorContainer}>
              <Ionicons name="information-circle" size={48} color={colors.accent.safetyOrange} />
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={fetchTodayTrip}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            </View>
          )}

          {!loading && !error && !trip && (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={colors.neutral.textSecondary} />
              <Text style={styles.emptyText}>No trip scheduled for today</Text>
            </View>
          )}

          {!loading && !error && trip && (
            <>
              {/* Trip Info */}
              <Animated.View entering={FadeInDown.delay(100).springify()}>
                <Text style={styles.routeName}>{trip.route?.name || 'Route'}</Text>
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </Animated.View>

              {/* Summary Stats Cards */}
              <View style={styles.statsContainer}>
                {/* Total Children Card */}
                <Animated.View
                  entering={FadeInDown.delay(200).springify()}
                  style={styles.statCard}
                >
                  <Pressable onPress={() => navigation.navigate("ChildList", { filter: "all" })}>
                    <LiquidGlassCard intensity="heavy">
                      <View style={styles.statContent}>
                        <View
                          style={[
                            styles.iconCircle,
                            { backgroundColor: colors.primary.yellow + "20" },
                          ]}
                        >
                          <Ionicons name="people" size={32} color={colors.primary.yellow} />
                        </View>
                        <Text style={styles.statValue}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Total Children</Text>
                      </View>
                    </LiquidGlassCard>
                  </Pressable>
                </Animated.View>

                {/* Picked Up Card */}
                <Animated.View
                  entering={FadeInDown.delay(300).springify()}
                  style={styles.statCard}
                >
                  <Pressable onPress={() => navigation.navigate("ChildList", { filter: "picked_up" })}>
                    <LiquidGlassCard intensity="heavy">
                      <View style={styles.statContent}>
                        <View
                          style={[
                            styles.iconCircle,
                            { backgroundColor: colors.accent.safetyOrange + "20" },
                          ]}
                        >
                          <Ionicons
                            name="arrow-up-circle"
                            size={32}
                            color={colors.accent.safetyOrange}
                          />
                        </View>
                        <Text style={styles.statValue}>{stats.pickedUp}</Text>
                        <Text style={styles.statLabel}>Picked Up</Text>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${pickedUpPercentage}%`,
                                backgroundColor: colors.accent.safetyOrange,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </LiquidGlassCard>
                  </Pressable>
                </Animated.View>

                {/* Dropped Off Card */}
                <Animated.View
                  entering={FadeInDown.delay(400).springify()}
                  style={styles.statCard}
                >
                  <Pressable onPress={() => navigation.navigate("ChildList", { filter: "dropped_off" })}>
                    <LiquidGlassCard intensity="heavy">
                      <View style={styles.statContent}>
                        <View
                          style={[
                            styles.iconCircle,
                            { backgroundColor: colors.status.success + "20" },
                          ]}
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={32}
                            color={colors.status.success}
                          />
                        </View>
                        <Text style={styles.statValue}>{stats.droppedOff}</Text>
                        <Text style={styles.statLabel}>Dropped Off</Text>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${droppedOffPercentage}%`,
                                backgroundColor: colors.status.success,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </LiquidGlassCard>
                  </Pressable>
                </Animated.View>
              </View>

              {/* Children List */}
              <Animated.View entering={FadeInDown.delay(500).springify()}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Children List</Text>
                  {childrenOnTrip.map((attendance: any, index: number) => {
                    const child = attendance.child;
                    const status = attendance.status;
                    const childName = child ? `${child.firstName || ''} ${child.lastName || ''}`.trim() : 'Unknown';
                    const initials = childName.split(' ').map((n: string) => n[0] || '').join('').toUpperCase() || 'U';

                    let statusColor: string = colors.neutral.textSecondary;
                    let statusIcon: keyof typeof Ionicons.glyphMap = "time-outline";
                    let statusText = "Waiting";

                    if (status === "PICKED_UP" || status === "ON_WAY") {
                      statusColor = colors.accent.safetyOrange;
                      statusIcon = "arrow-up-circle";
                      statusText = "Picked Up";
                    } else if (status === "DROPPED") {
                      statusColor = colors.status.success;
                      statusIcon = "checkmark-circle";
                      statusText = "Dropped Off";
                    }

                    if (!child) return null;

                    return (
                      <Animated.View
                        key={child.id}
                        entering={FadeInDown.delay(600 + index * 50).springify()}
                        style={styles.childItem}
                      >
                        <LiquidGlassCard intensity="medium">
                          <Pressable
                            onPress={() => navigation.navigate("ChildList")}
                            style={styles.childContent}
                          >
                            <View style={styles.childInfo}>
                              <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>
                                  {initials}
                                </Text>
                              </View>
                              <View style={styles.childDetails}>
                                <Text style={styles.childName}>{childName}</Text>
                                <Text style={styles.childAddress}>
                                  {child.pickupLocation?.address || child.homeAddress || 'N/A'}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.statusBadge}>
                              <Ionicons name={statusIcon} size={16} color={statusColor} />
                              <Text style={[styles.statusText, { color: statusColor }]}>
                                {statusText}
                              </Text>
                            </View>
                          </Pressable>
                        </LiquidGlassCard>
                      </Animated.View>
                    );
                  })}
                </View>
              </Animated.View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.creamWhite,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 8,
  },
  routeName: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: colors.neutral.creamWhite,
    marginBottom: 24,
  },
  statsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    width: "100%",
  },
  statContent: {
    padding: 20,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    color: colors.neutral.textSecondary,
    fontWeight: "600",
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: colors.neutral.textSecondary + "20",
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 12,
  },
  childItem: {
    marginBottom: 12,
  },
  childContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.blue + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary.blue,
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  childAddress: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.neutral.creamWhite,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  actionButton: {
    width: "100%",
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.neutral.textSecondary,
  },
  errorContainer: {
    alignItems: "center",
    padding: 20,
    marginVertical: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.accent.sunsetOrange,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.primary.blue,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.neutral.pureWhite,
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
    marginVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.neutral.textSecondary,
    textAlign: "center",
  },
});
