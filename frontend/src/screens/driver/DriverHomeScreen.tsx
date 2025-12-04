/**
 * Driver Home Screen
 * Main dashboard for drivers showing today's trip
 */

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { LargeCTAButton } from "../../components/ui/LargeCTAButton";
import { useAuthStore } from "../../stores/authStore";
import { apiClient } from "../../utils/api";
import { DriverStackParamList } from "../../navigation/DriverNavigator";

type NavigationProp = NativeStackNavigationProp<DriverStackParamList>;

export default function DriverHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayTrip = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[DriverHomeScreen] fetchTodayTrip called, user:', user);
      if (!user?.id) {
        console.log('[DriverHomeScreen] No user ID available');
        setLoading(false);
        return;
      }

      console.log('[DriverHomeScreen] Making API call to /drivers/' + user.id + '/today-trip');
      const response = await apiClient.get<any>(`/drivers/${user.id}/today-trip`);
      console.log('[DriverHomeScreen] API response:', response);
      setTrip(response);
    } catch (err: any) {
      console.log('[DriverHomeScreen] Error fetching trip:', err);
      console.log('[DriverHomeScreen] Error code:', err.code);
      console.log('[DriverHomeScreen] Error message:', err.message);
      console.log('[DriverHomeScreen] Error response:', err.response);
      setError(err.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        fetchTodayTrip();
      }
    }, [user?.id])
  );

  const childrenOnTrip = trip?.attendances || [];

  const handleStartTrip = () => {
    navigation.navigate("ChildList");
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[colors.primary.teal, colors.accent.successGreen]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.userName}>{user?.name || 'Driver'}</Text>
          </View>
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={colors.neutral.pureWhite} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.blue} />
              <Text style={styles.loadingText}>Loading trip information...</Text>
            </View>
          )}

          {error && !loading && (
            <LiquidGlassCard className="mb-4" intensity="medium">
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={24} color={colors.status.dangerRed} />
                <Text style={styles.errorText}>{error}</Text>
                <Pressable onPress={fetchTodayTrip} style={styles.retryButton}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </View>
            </LiquidGlassCard>
          )}

          {!loading && !error && trip && (
            <>
              {/* Trip Info Card */}
              <LiquidGlassCard className="mb-4" intensity="heavy">
                <View style={styles.tripCard}>
                  <View style={styles.tripHeader}>
                    <Ionicons name="calendar" size={24} color={colors.primary.blue} />
                    <Text style={styles.tripTitle}>Today&apos;s Trip</Text>
                  </View>
                  <Text style={styles.routeName}>{trip.route?.name || 'No Route Assigned'}</Text>
                  <View style={styles.tripStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{childrenOnTrip.length}</Text>
                      <Text style={styles.statLabel}>Children</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {trip.status === "IN_PROGRESS" ? "In Progress" : trip.status === "SCHEDULED" ? "Scheduled" : trip.status}
                      </Text>
                      <Text style={styles.statLabel}>Status</Text>
                    </View>
                  </View>
                </View>
              </LiquidGlassCard>

              {/* Start Trip Button */}
              {trip.status === "SCHEDULED" && (
                <LargeCTAButton
                  title="Start Trip"
                  onPress={handleStartTrip}
                  variant="success"
                  style={styles.startButton}
                />
              )}

              {trip.status === "IN_PROGRESS" && (
                <LargeCTAButton
                  title="View Attendance"
                  onPress={handleStartTrip}
                  variant="primary"
                  style={styles.startButton}
                />
              )}
            </>
          )}

          {!loading && !error && !trip && (
            <LiquidGlassCard className="mb-4" intensity="medium">
              <View style={styles.emptyContainer}>
                <Ionicons name="information-circle" size={48} color={colors.neutral.textSecondary} />
                <Text style={styles.emptyText}>No trips scheduled for today</Text>
              </View>
            </LiquidGlassCard>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Pressable onPress={() => navigation.navigate("Attendance")} style={styles.actionCard}>
                <LiquidGlassCard intensity="medium">
                  <View style={styles.actionContent}>
                    <Ionicons name="people" size={32} color={colors.primary.blue} />
                    <Text style={styles.actionText}>Attendance</Text>
                  </View>
                </LiquidGlassCard>
              </Pressable>

              <Pressable onPress={() => navigation.navigate("RouteMap")} style={styles.actionCard}>
                <LiquidGlassCard intensity="medium">
                  <View style={styles.actionContent}>
                    <Ionicons name="map" size={32} color={colors.accent.successGreen} />
                    <Text style={styles.actionText}>Route Map</Text>
                  </View>
                </LiquidGlassCard>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("BroadcastMessage")}
                style={styles.actionCard}
              >
                <LiquidGlassCard intensity="medium">
                  <View style={styles.actionContent}>
                    <Ionicons name="megaphone" size={32} color={colors.accent.sunsetOrange} />
                    <Text style={styles.actionText}>Broadcast</Text>
                  </View>
                </LiquidGlassCard>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("EarlyPickupRequests")}
                style={styles.actionCard}
              >
                <LiquidGlassCard intensity="medium">
                  <View style={styles.actionContent}>
                    <Ionicons name="arrow-up-circle" size={32} color={colors.status.warningYellow} />
                    <Text style={styles.actionText}>Early Pickups</Text>
                  </View>
                </LiquidGlassCard>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("DriverSettings")}
                style={styles.actionCard}
              >
                <LiquidGlassCard intensity="medium">
                  <View style={styles.actionContent}>
                    <Ionicons name="settings" size={32} color={colors.neutral.textSecondary} />
                    <Text style={styles.actionText}>Settings</Text>
                  </View>
                </LiquidGlassCard>
              </Pressable>
            </View>
          </View>
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
  greeting: {
    fontSize: 14,
    color: colors.neutral.creamWhite,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 8,
  },
  tripCard: {
    padding: 8,
  },
  tripHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  routeName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 16,
  },
  tripStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral.textSecondary,
    opacity: 0.3,
  },
  startButton: {
    width: "100%",
    marginBottom: 24,
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
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
  },
  actionContent: {
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
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
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.status.dangerRed,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: colors.primary.blue,
    borderRadius: 8,
  },
  retryText: {
    color: colors.neutral.pureWhite,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.neutral.textSecondary,
    textAlign: "center",
  },
});
