/**
 * Parent Home Screen
 * Main dashboard for parents showing children, pickup status, driver info, and quick actions
 */

import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { LargeCTAButton } from "../../components/ui/LargeCTAButton";
import { ChildTile } from "../../components/shared/ChildTile";
import { DriverInfoBanner } from "../../components/shared/DriverInfoBanner";
import { ETAChip } from "../../components/shared/ETAChip";
import { useAuthStore } from "../../stores/authStore";
import { apiClient } from "../../utils/api";
import { socketService } from "../../utils/socket";
import { ParentStackParamList, ParentTabParamList } from "../../navigation/ParentNavigator";
import { Child } from "../../types";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<ParentTabParamList, "Home">,
  NativeStackNavigationProp<ParentStackParamList>
>;

export default function ParentHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayTrip, setTodayTrip] = useState<any>(null);

  // Fetch children when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      fetchChildren();
    }, [user?.id])
  );

  // Setup WebSocket listeners for real-time updates
  useEffect(() => {
    console.log('[ParentHome] Setting up WebSocket listeners');
    
    // Listen for attendance updates
    const handleAttendanceUpdate = (data: any) => {
      console.log('[ParentHome] Attendance update received:', data);
      
      // Show notification to parent
      let title = 'Status Update';
      let message = '';
      
      if (data.status === 'PICKED_UP') {
        title = 'Child Picked Up!';
        message = `${data.childName} has been picked up by the bus driver.`;
      } else if (data.status === 'DROPPED') {
        title = 'Child Dropped Off!';
        message = `${data.childName} has been safely dropped off at school.`;
      }

      if (message) {
        Alert.alert(title, message);
      }

      // Refresh the data to reflect changes
      fetchChildren();
    };

    // Listen for early pickup approvals/rejections
    const handleEarlyPickupApproved = (data: any) => {
      console.log('[ParentHome] Early pickup approved:', data);
      Alert.alert(
        'Pickup Approved!',
        `Your early pickup request for ${data.childName} has been approved.`
      );
      fetchChildren();
    };

    const handleEarlyPickupRejected = (data: any) => {
      console.log('[ParentHome] Early pickup rejected:', data);
      Alert.alert(
        'Pickup Rejected',
        `Your early pickup request for ${data.childName} was rejected.${data.reason ? ` Reason: ${data.reason}` : ''}`
      );
      fetchChildren();
    };

    // Connect to socket and register listeners
    const initSocket = async () => {
      await socketService.connect();
      console.log('[ParentHome] Socket connected, registering listeners');
    };
    
    // Register listeners first (they'll be re-registered on reconnect)
    socketService.on('attendance_updated', handleAttendanceUpdate);
    socketService.on('early_pickup_approved', handleEarlyPickupApproved);
    socketService.on('early_pickup_rejected', handleEarlyPickupRejected);
    
    // Then connect
    initSocket();

    return () => {
      console.log('[ParentHome] Cleaning up WebSocket listeners');
      socketService.off('attendance_updated', handleAttendanceUpdate);
      socketService.off('early_pickup_approved', handleEarlyPickupApproved);
      socketService.off('early_pickup_rejected', handleEarlyPickupRejected);
    };
  }, []);



  const fetchChildren = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<Child[]>(`/children/parent/${user.id}`);
      console.log('[ParentHome] Fetched children:', response);
      setChildren(Array.isArray(response) ? response : []);
      
      // Fetch trip for the first child (they should all be on the same trip)
      if (Array.isArray(response) && response.length > 0) {
        const firstChild = response[0];
        try {
          const tripResponse = await apiClient.get(`/trips/child/${firstChild.id}`);
          console.log('[ParentHome] Fetched trip for child:', tripResponse);
          setTodayTrip(tripResponse);
        } catch (tripErr: any) {
          console.log('[ParentHome] Error fetching child trip:', tripErr);
          // Trip not found is okay - child might not be on a trip today
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to load children';
      console.log('[ParentHome] Error fetching children:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const driver = todayTrip?.bus?.driver?.user || null;
  const bus = todayTrip?.bus || null;
  const unreadCount = 0; // TODO: Fetch from notifications API
  const estimatedArrival = todayTrip?.estimatedArrival || null; // Will be null if no trip

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary.blue, colors.primary.teal]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
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
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <LiquidGlassCard className="mb-4" intensity="heavy">
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Ionicons name="bus" size={24} color={colors.status.infoBlue} />
                  <Text style={styles.statusTitle}>Pickup Status</Text>
                </View>
                <View style={styles.statusContent}>
                  {todayTrip ? (
                    <>
                      <Text style={styles.statusText}>Bus is on the way</Text>
                      {estimatedArrival && <ETAChip minutes={estimatedArrival} variant="default" />}
                    </>
                  ) : (
                    <Text style={styles.statusText}>No trip scheduled for today</Text>
                  )}
                </View>
              </View>
            </LiquidGlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Driver</Text>
              {driver && bus ? (
                <DriverInfoBanner driver={driver} busPlateNumber={bus.plateNumber} />
              ) : (
                <LiquidGlassCard>
                  <Text style={styles.emptyText}>No trip scheduled for today</Text>
                </LiquidGlassCard>
              )}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Children</Text>
                <Pressable onPress={() => navigation.navigate("AddChild")}>
                  <Ionicons name="add-circle" size={28} color={colors.primary.blue} />
                </Pressable>
              </View>
              
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary.blue} />
                </View>
              )}
              
              {error && !isLoading && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <LargeCTAButton 
                    title="Retry" 
                    onPress={fetchChildren}
                    variant="secondary"
                    style={styles.retryButton}
                  />
                </View>
              )}
              
              {!isLoading && !error && children.length === 0 && (
                <Text style={styles.emptyText}>No children added yet</Text>
              )}
              
              {children.map((child, index) => (
                <Animated.View
                  key={child.id}
                  entering={FadeInDown.delay(400 + index * 100).duration(500)}
                >
                  <ChildTile
                    child={child}
                    onPress={() => navigation.navigate("Tracking")}
                    tripId={todayTrip?.id}
                    showActions={true}
                    onActionComplete={() => {
                      fetchChildren();
                    }}
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>

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
          </Animated.View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: colors.status.dangerRed,
    textAlign: "center",
  },
  retryButton: {
    width: "100%",
  },
  emptyText: {
    fontSize: 16,
    color: colors.neutral.textSecondary,
    textAlign: "center",
    marginVertical: 12,
  },
});
