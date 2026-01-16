/**
 * Driver Home Screen
 * Main dashboard for drivers showing today's trip
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { LargeCTAButton } from "../../components/ui/LargeCTAButton";
import { GlowingOrb } from "../../components/ui/GlowingOrb";
import { useAuthStore } from "../../state/authStore";
import { mockTrip, mockChildren } from "../../mock/data";
import { DriverStackParamList } from "../../navigation/DriverNavigator";

type NavigationProp = NativeStackNavigationProp<DriverStackParamList>;

export default function DriverHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // TODO: Replace with actual API call to fetch today's trip
  const trip = mockTrip;
  const childrenOnTrip = mockChildren.filter((c) => trip.childIds.includes(c.id));

  const handleStartTrip = () => {
    // Navigate to child list for attendance
    navigation.navigate("ChildList");
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#FFD400", "#FFC800", "#FF6B35"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />

      {/* Floating Glowing Orbs */}
      <GlowingOrb
        size={180}
        color="rgba(255, 255, 255, 0.65)"
        delay={0}
        duration={10000}
        startX={-40}
        startY={10}
      />
      <GlowingOrb
        size={130}
        color="rgba(255, 220, 100, 0.7)"
        delay={2000}
        duration={12000}
        startX={220}
        startY={40}
      />
      <GlowingOrb
        size={110}
        color="rgba(255, 150, 80, 0.6)"
        delay={4000}
        duration={15000}
        startX={120}
        startY={70}
      />
      <GlowingOrb
        size={90}
        color="rgba(255, 200, 200, 0.55)"
        delay={6000}
        duration={13000}
        startX={40}
        startY={100}
      />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
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
          {/* Trip Info Card */}
          <LiquidGlassCard className="mb-4" intensity="heavy">
            <View style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Ionicons name="calendar" size={24} color={colors.primary.yellow} />
                <Text style={styles.tripTitle}>Today&apos;s Trip</Text>
              </View>
              <Text style={styles.routeName}>Osu - Greenfield Route</Text>
              <View style={styles.tripStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{childrenOnTrip.length}</Text>
                  <Text style={styles.statLabel}>Children</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {trip.status === "in_progress" ? "In Progress" : "Pending"}
                  </Text>
                  <Text style={styles.statLabel}>Status</Text>
                </View>
              </View>
            </View>
          </LiquidGlassCard>

          {/* Start Trip Button */}
          {trip.status === "pending" && (
            <LargeCTAButton
              title="Start Trip"
              onPress={handleStartTrip}
              variant="success"
              style={styles.startButton}
            />
          )}

          {trip.status === "in_progress" && (
            <LargeCTAButton
              title="View Attendance"
              onPress={handleStartTrip}
              variant="primary"
              style={styles.startButton}
            />
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Pressable onPress={() => navigation.navigate("Attendance")} style={styles.actionCard}>
                <LiquidGlassCard intensity="medium">
                  <View style={styles.actionContent}>
                    <Ionicons name="people" size={32} color={colors.primary.yellow} />
                    <Text style={styles.actionText}>Attendance</Text>
                  </View>
                </LiquidGlassCard>
              </Pressable>

              <Pressable onPress={() => navigation.navigate("RouteMap")} style={styles.actionCard}>
                <LiquidGlassCard intensity="medium">
                  <View style={styles.actionContent}>
                    <Ionicons name="map" size={32} color={colors.status.success} />
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
                    <Ionicons name="megaphone" size={32} color={colors.accent.safetyOrange} />
                    <Text style={styles.actionText}>Broadcast</Text>
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
    backgroundColor: colors.neutral.warmCream,
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
    color: colors.neutral.warmCream,
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
});
