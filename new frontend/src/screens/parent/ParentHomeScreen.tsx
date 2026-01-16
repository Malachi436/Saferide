/**
 * Parent Home Screen
 * Main dashboard for parents showing children, pickup status, driver info, and quick actions
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { LargeCTAButton } from "../../components/ui/LargeCTAButton";
import { GlowingOrb } from "../../components/ui/GlowingOrb";
import { ChildTile } from "../../components/shared/ChildTile";
import { DriverInfoBanner } from "../../components/shared/DriverInfoBanner";
import { ETAChip } from "../../components/shared/ETAChip";
import { useAuthStore } from "../../state/authStore";
import { mockChildren, mockDriver, mockBuses, mockNotifications } from "../../mock/data";
import { ParentStackParamList, ParentTabParamList } from "../../navigation/ParentNavigator";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<ParentTabParamList, "Home">,
  NativeStackNavigationProp<ParentStackParamList>
>;

export default function ParentHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // TODO: Replace with actual API call to fetch parent's children
  const children = mockChildren.filter((c) => c.parentId === user?.id);

  // TODO: Replace with actual API call to fetch driver
  const driver = mockDriver;

  // TODO: Replace with actual API call to fetch bus details
  const bus = mockBuses[0];

  // TODO: Replace with actual API call to fetch unread notifications count
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  // Mock ETA (in minutes)
  const estimatedArrival = 12;

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      {/* Background gradient - Pure School Bus Yellow to Orange */}
      <LinearGradient
        colors={["#FFD400", "#FFC800", "#FF6B35"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />

      {/* Floating Glowing Orbs - Much brighter! */}
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
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate("Notifications")}
              style={styles.notificationButton}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.primary.black} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color={colors.primary.black} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Pickup Status Card */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <LiquidGlassCard className="mb-4" intensity="heavy">
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Ionicons name="bus" size={24} color={colors.accent.safetyOrange} />
                  <Text style={styles.statusTitle}>Pickup Status</Text>
                </View>
                <View style={styles.statusContent}>
                  <Text style={styles.statusText}>Bus is on the way</Text>
                  <ETAChip minutes={estimatedArrival} variant="default" />
                </View>
              </View>
            </LiquidGlassCard>
          </Animated.View>

          {/* Driver Info */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Driver</Text>
              <DriverInfoBanner driver={driver} busPlateNumber={bus.plateNumber} />
            </View>
          </Animated.View>

          {/* Children List */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Children</Text>
                <Pressable onPress={() => navigation.navigate("AddChild")}>
                  <Ionicons name="add-circle" size={28} color={colors.primary.yellow} />
                </Pressable>
              </View>
              {children.map((child, index) => (
                <Animated.View
                  key={child.id}
                  entering={FadeInDown.delay(400 + index * 100).duration(500)}
                >
                  <ChildTile
                    child={child}
                    onPress={() => navigation.navigate("Tracking")}
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(600).duration(500)}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <Pressable
                  onPress={() => navigation.navigate("Tracking")}
                  style={styles.actionCard}
                >
                  <LiquidGlassCard intensity="medium">
                    <View style={styles.actionContent}>
                      <Ionicons name="location" size={32} color={colors.primary.yellow} />
                      <Text style={styles.actionText}>Live Tracking</Text>
                    </View>
                  </LiquidGlassCard>
                </Pressable>

                <Pressable onPress={() => navigation.navigate("Payments")} style={styles.actionCard}>
                  <LiquidGlassCard intensity="medium">
                    <View style={styles.actionContent}>
                      <Ionicons name="card" size={32} color={colors.status.success} />
                      <Text style={styles.actionText}>Payments</Text>
                    </View>
                  </LiquidGlassCard>
                </Pressable>

                <Pressable
                  onPress={() => navigation.navigate("ReceiptHistory")}
                  style={styles.actionCard}
                >
                  <LiquidGlassCard intensity="medium">
                    <View style={styles.actionContent}>
                      <Ionicons name="receipt" size={32} color={colors.accent.safetyOrange} />
                      <Text style={styles.actionText}>Receipts</Text>
                    </View>
                  </LiquidGlassCard>
                </Pressable>

                <Pressable
                  onPress={() => navigation.navigate("Settings")}
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
          </Animated.View>

          {/* Payment Banner */}
          <Animated.View entering={FadeInDown.delay(700).duration(500)}>
            <LiquidGlassCard className="mb-6" intensity="heavy">
              <View style={styles.paymentBanner}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentTitle}>Weekly Payment Due</Text>
                  <Text style={styles.paymentAmount}>GHS 300.00</Text>
                  <Text style={styles.paymentDate}>Due in 2 days</Text>
                </View>
                <LargeCTAButton
                  title="Pay Now"
                  onPress={() => navigation.navigate("Payments")}
                  variant="success"
                  style={styles.payButton}
                />
              </View>
            </LiquidGlassCard>
          </Animated.View>
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
    fontSize: 15,
    color: colors.primary.black,
    marginBottom: 4,
    fontWeight: "600",
  },
  userName: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary.black,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 3,
    borderColor: colors.primary.black,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.primary.black,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: colors.status.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    color: colors.neutral.pureWhite,
    fontSize: 11,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 8,
  },
  statusCard: {
    padding: 8,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  statusContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  paymentBanner: {
    padding: 8,
  },
  paymentInfo: {
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 13,
    color: colors.status.warning,
    fontWeight: "600",
  },
  payButton: {
    width: "100%",
  },
});
