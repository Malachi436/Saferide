/**
 * Parent Home Screen
 * Main dashboard for parents showing children, pickup status, driver info, and quick actions
 */

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { LargeCTAButton } from "../../components/ui/LargeCTAButton";
import { ChildTile } from "../../components/shared/ChildTile";
import { DriverInfoBanner } from "../../components/shared/DriverInfoBanner";
import { ETAChip } from "../../components/shared/ETAChip";
import { useAuthStore } from "../../state/authStore";
import { childrenService, notificationsService, gpsService } from "../../api";
import { Child, Driver, Bus } from "../../types/models";
import { ParentStackParamList, ParentTabParamList } from "../../navigation/ParentNavigator";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<ParentTabParamList, "Home">,
  NativeStackNavigationProp<ParentStackParamList>
>;

export default function ParentHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s: any) => s.user);
  const logout = useAuthStore((s: any) => s.logout);

  const [children, setChildren] = useState<Child[]>([]);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [bus, setBus] = useState<Bus | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [estimatedArrival, setEstimatedArrival] = useState(12); // Mock ETA in minutes
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch parent's children
      const fetchedChildren = await childrenService.getChildrenByParent(user.id);
      setChildren(fetchedChildren);
      
      // Fetch unread notifications count
      const unreadNotifications = await notificationsService.getUnreadCount(user.id);
      setUnreadCount(unreadNotifications);
      
      // TODO: Fetch driver and bus details
      // This would require additional API endpoints to get driver/bus info by child
      
    } catch (error) {
      Alert.alert("Error", "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[colors.primary.blue, colors.primary.teal]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
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
              <Ionicons name="notifications-outline" size={24} color={colors.neutral.pureWhite} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color={colors.neutral.pureWhite} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Pickup Status Card */}
          <View>
            <LiquidGlassCard className="mb-4" intensity="heavy">
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Ionicons name="bus" size={24} color={colors.status.infoBlue} />
                  <Text style={styles.statusTitle}>Pickup Status</Text>
                </View>
                <View style={styles.statusContent}>
                  <Text style={styles.statusText}>Bus is on the way</Text>
                  <ETAChip minutes={estimatedArrival} variant="default" />
                </View>
              </View>
            </LiquidGlassCard>
          </View>

          {/* Driver Info */}
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Driver</Text>
              {driver ? (
                <DriverInfoBanner driver={driver} busPlateNumber={bus?.plateNumber || ""} />
              ) : (
                <Text>Loading driver information...</Text>
              )}
            </View>
          </View>

          {/* Children List */}
          <View>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Children</Text>
                <Pressable onPress={() => navigation.navigate("AddChild")}>
                  <Ionicons name="add-circle" size={28} color={colors.primary.blue} />
                </Pressable>
              </View>
              {children.map((child, index) => (
                <View
                  key={child.id}
                >
                  <ChildTile
                    child={child}
                    onPress={() => navigation.navigate("Tracking")}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <Pressable
                  onPress={() => navigation.navigate("Tracking")}
                  style={styles.actionCard}
                >
                  <LiquidGlassCard intensity="medium">
                    <View style={styles.actionContent}>
                      <Ionicons name="location" size={32} color={colors.primary.blue} />
                      <Text style={styles.actionText}>Live Tracking</Text>
                    </View>
                  </LiquidGlassCard>
                </Pressable>

                <Pressable onPress={() => navigation.navigate("Payments")} style={styles.actionCard}>
                  <LiquidGlassCard intensity="medium">
                    <View style={styles.actionContent}>
                      <Ionicons name="card" size={32} color={colors.accent.successGreen} />
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
                      <Ionicons name="receipt" size={32} color={colors.accent.sunsetOrange} />
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
          </View>

          {/* Payment Banner */}
          <View>
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
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: colors.status.dangerRed,
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
    color: colors.status.warningYellow,
    fontWeight: "600",
  },
  payButton: {
    width: "100%",
  },
});