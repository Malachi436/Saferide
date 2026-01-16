/**
 * Driver Home Screen
 * Main dashboard for drivers showing today's trip
 */

import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Switch, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { LargeCTAButton } from "../../components/ui/LargeCTAButton";
import { GlowingOrb } from "../../components/ui/GlowingOrb";
import { useAuthStore } from "../../stores/authStore";
import { apiClient } from "../../utils/api";
import { socketService } from "../../utils/socket";
import { gpsService } from "../../services/gpsService";
import { DriverStackParamList } from "../../navigation/DriverNavigator";

type NavigationProp = NativeStackNavigationProp<DriverStackParamList>;

export default function DriverHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGPSTracking, setIsGPSTracking] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchUnreadNotifications = async () => {
    try {
      if (!user?.id) return;
      const response: any = await apiClient.get(`/notifications/unread-count/${user.id}`);
      setUnreadNotifications(response.count || 0);
    } catch (err) {
      console.error('Error loading notifications count:', err);
    }
  };

  // Fetch unread notifications on mount and focus
  useEffect(() => {
    fetchUnreadNotifications();
  }, [user?.id]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchTodayTrip(),
        fetchUnreadNotifications(),
      ]);
    } catch (error) {
      console.error('[DriverHome] Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    socketService.connect();
    return () => {
      // Keep connection alive for other screens
    };
  }, []);

  // Subscribe to trip room for notifications
  useEffect(() => {
    if (trip?.id) {
      console.log('[DriverHome] Subscribing to trip room:', trip.id);
      socketService.subscribeToTrip(trip.id);

      // Listen for parent pickup requests
      const handleParentPickup = (data: any) => {
        console.log('[DriverHome] Parent pickup requested:', data);
        Alert.alert(
          'Parent Pickup Request',
          `${data.parentName} will pick up ${data.childName} in the ${data.timeOfDay?.toLowerCase() || 'day'}.\n\n${data.reason || ''}`,
          [
            { text: 'OK', onPress: fetchTodayTrip }
          ]
        );
      };

      // Listen for trip skip requests
      const handleTripSkip = (data: any) => {
        console.log('[DriverHome] Trip skip requested:', data);
        Alert.alert(
          'Child Skipping Trip',
          `${data.childName} will not join the bus today.\n\n${data.reason || ''}`,
          [
            { text: 'OK', onPress: fetchTodayTrip }
          ]
        );
      };

      socketService.on('parent_pickup_requested', handleParentPickup);
      socketService.on('trip_skip_requested', handleTripSkip);

      return () => {
        socketService.off('parent_pickup_requested', handleParentPickup);
        socketService.off('trip_skip_requested', handleTripSkip);
        socketService.unsubscribeFromTrip(trip.id);
      };
    }
  }, [trip?.id]);

  const childrenOnTrip = trip?.attendances || [];

  const handleStartTrip = async () => {
    if (!trip) return;

    if (trip.status === 'SCHEDULED') {
      // Transition to IN_PROGRESS
      Alert.alert(
        'Start Trip',
        'Are you ready to start this trip? GPS tracking will begin.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Trip',
            style: 'default',
            onPress: async () => {
              try {
                await apiClient.patch(`/trips/${trip.id}/status`, {
                  status: 'IN_PROGRESS',
                  userId: user?.id,
                });
                
                // Auto-start GPS tracking
                if (!isGPSTracking) {
                  await toggleGPSTracking();
                }
                
                Alert.alert('Trip Started', 'Trip is now in progress. Safe driving!');
                await fetchTodayTrip();
              } catch (err: any) {
                Alert.alert('Error', err.response?.data?.message || 'Failed to start trip');
              }
            },
          },
        ]
      );
    } else {
      // Navigate to attendance if trip is in progress
      navigation.navigate("Attendance");
    }
  };

  const handleEndTrip = async () => {
    if (!trip) return;

    // Check if trip can be completed
    const canComplete = trip.status === 'IN_PROGRESS' || 
                        trip.status === 'ARRIVED_SCHOOL' || 
                        trip.status === 'RETURN_IN_PROGRESS';

    if (!canComplete) {
      Alert.alert('Cannot End Trip', 'Trip must be started before it can be completed.');
      return;
    }

    Alert.alert(
      'Complete Trip',
      'Are you sure you want to end this trip? GPS tracking will stop.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.patch(`/trips/${trip.id}/status`, {
                status: 'COMPLETED',
                userId: user?.id,
              });
              
              // Stop GPS tracking
              if (isGPSTracking) {
                gpsService.stopTracking();
                setIsGPSTracking(false);
              }
              
              Alert.alert('Trip Completed', 'Trip has been marked as completed successfully.');
              await fetchTodayTrip();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to complete trip');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    logout();
  };

  const toggleGPSTracking = useCallback(async () => {
    console.log('[DriverHome] GPS toggle pressed, current state:', isGPSTracking);
    
    try {
      if (isGPSTracking) {
        console.log('[DriverHome] Stopping GPS tracking');
        gpsService.stopTracking();
        setIsGPSTracking(false);
        setGpsError(null);
        Alert.alert('GPS Stopped', 'Location tracking has been stopped.');
      } else {
        console.log('[DriverHome] Starting GPS tracking');
        
        // Ensure socket connection
        if (!socketService.isConnected()) {
          console.log('[DriverHome] Socket not connected, connecting...');
          await socketService.connect();
          
          // Wait for connection to establish
          let attempts = 0;
          while (!socketService.isConnected() && attempts < 10) {
            console.log('[DriverHome] Waiting for socket connection, attempt:', attempts + 1);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
          }
          
          if (!socketService.isConnected()) {
            throw new Error('Could not establish connection to server. Please check your internet connection.');
          }
        }
        
        const busId = trip?.bus?.id || trip?.busId || 'unknown-bus';
        console.log('[DriverHome] Starting GPS for busId:', busId);
        
        // Get the socket instance
        const socket = socketService.getSocket();
        if (!socket || !socket.connected) {
          throw new Error('Connection not ready. Please try again.');
        }
        
        console.log('[DriverHome] Socket ID:', socket.id, 'Connected:', socket.connected);
        
        await gpsService.startTracking(socket, busId, 5000);
        setIsGPSTracking(true);
        setGpsError(null);
        Alert.alert('GPS Started', 'Your location is now being shared.');
      }
    } catch (err: any) {
      console.error('[DriverHome] GPS toggle error:', err);
      setGpsError(err.message);
      setIsGPSTracking(false);
      Alert.alert('GPS Error', err.message || 'Failed to start GPS tracking');
    }
  }, [isGPSTracking, trip]);

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
            <Text style={styles.userName}>{user?.name || 'Driver'}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable 
              onPress={() => navigation.navigate("DriverNotifications")} 
              style={styles.notificationButton}
            >
              <Ionicons name="notifications" size={24} color={colors.neutral.pureWhite} />
              {unreadNotifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Text>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.neutral.pureWhite}
              colors={[colors.primary.yellow]}
            />
          }
        >
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.yellow} />
              <Text style={styles.loadingText}>Loading trip information...</Text>
            </View>
          )}

          {error && !loading && (
            <LiquidGlassCard className="mb-4" intensity="medium">
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={24} color={colors.status.danger} />
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
                    <Ionicons name="calendar" size={24} color={colors.primary.yellow} />
                    <Text style={styles.tripTitle}>Today&apos;s Trip</Text>
                  </View>
                  <Text style={styles.routeName}>{trip.route?.name || 'No Route Assigned'}</Text>
                  {trip.route?.shift && (
                    <View style={[
                      styles.shiftBadge,
                      trip.route.shift === 'MORNING' 
                        ? styles.morningBadge 
                        : styles.eveningBadge
                    ]}>
                      <Ionicons 
                        name={trip.route.shift === 'MORNING' ? 'sunny' : 'moon'} 
                        size={14} 
                        color={trip.route.shift === 'MORNING' ? '#F59E0B' : '#6366F1'} 
                      />
                      <Text style={[
                        styles.shiftText,
                        trip.route.shift === 'MORNING' 
                          ? styles.morningText 
                          : styles.eveningText
                      ]}>
                        {trip.route.shift === 'MORNING' ? 'Morning Shift' : 'Evening Shift'}
                      </Text>
                    </View>
                  )}
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

              {/* GPS Tracking Card - Add this after Trip Info Card */}
              <Pressable onPress={toggleGPSTracking}>
                <LiquidGlassCard className="mb-4" intensity="medium">
                  <View style={styles.gpsCard}>
                    <View style={styles.gpsInfo}>
                      <Ionicons 
                        name={isGPSTracking ? "location" : "location-outline"} 
                        size={24} 
                        color={isGPSTracking ? colors.status.success : colors.neutral.textSecondary} 
                      />
                      <View style={styles.gpsTextContainer}>
                        <Text style={styles.gpsTitle}>Live GPS Tracking</Text>
                        <Text style={[
                          styles.gpsStatus, 
                          isGPSTracking && { color: colors.status.success }
                        ]}>
                          {isGPSTracking ? 'Tracking active' : 'Tap to start tracking'}
                        </Text>
                        {gpsError && <Text style={styles.gpsErrorText}>{gpsError}</Text>}
                      </View>
                    </View>
                    <Switch
                      value={isGPSTracking}
                      onValueChange={toggleGPSTracking}
                      trackColor={{ false: '#E5E7EB', true: colors.status.success + '33' }}
                      thumbColor={isGPSTracking ? colors.status.success : '#9CA3AF'}
                    />
                  </View>
                </LiquidGlassCard>
              </Pressable>

              {/* Trip Action Buttons */}
              {trip.status === "SCHEDULED" && (
                <LargeCTAButton
                  title="🚀 Start Trip"
                  onPress={handleStartTrip}
                  variant="success"
                  style={styles.startButton}
                />
              )}

              {(trip.status === "IN_PROGRESS" || trip.status === "ARRIVED_SCHOOL" || trip.status === "RETURN_IN_PROGRESS") && (
                <LargeCTAButton
                  title="✓ End Trip"
                  onPress={handleEndTrip}
                  variant="danger"
                  style={styles.endButton}
                />
              )}

              {trip.status === "COMPLETED" && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.status.success} />
                  <Text style={styles.completedText}>Trip Completed</Text>
                </View>
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
                onPress={() => navigation.navigate("EarlyPickupRequests")}
                style={styles.actionCard}
              >
                <LiquidGlassCard intensity="medium">
                  <View style={styles.actionContent}>
                    <Ionicons name="arrow-up-circle" size={32} color={colors.status.warning} />
                    <Text style={styles.actionText}>Early Pickups</Text>
                  </View>
                </LiquidGlassCard>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("DriverNotifications")}
                style={styles.actionCard}
              >
                <LiquidGlassCard intensity="medium">
                  <View style={styles.actionContent}>
                    <View>
                      <Ionicons name="notifications" size={32} color={colors.accent.safetyOrange} />
                      {unreadNotifications > 0 && (
                        <View style={styles.actionBadge}>
                          <Text style={styles.actionBadgeText}>{unreadNotifications}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.actionText}>Notifications</Text>
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
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.status.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: colors.neutral.pureWhite,
    fontSize: 11,
    fontWeight: "700",
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
    marginBottom: 8,
  },
  shiftBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  morningBadge: {
    backgroundColor: "#FEF3C7",
  },
  eveningBadge: {
    backgroundColor: "#E0E7FF",
  },
  shiftText: {
    fontSize: 13,
    fontWeight: "600",
  },
  morningText: {
    color: "#F59E0B",
  },
  eveningText: {
    color: "#6366F1",
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
  endButton: {
    width: "100%",
    marginBottom: 24,
  },
  tripActionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    width: "100%",
  },
  tripActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  attendanceButton: {
    backgroundColor: colors.primary.yellow,
  },
  endTripButton: {
    backgroundColor: colors.status.danger,
  },
  tripActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.pureWhite,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: colors.status.success + "15",
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.status.success,
  },
  completedText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.status.success,
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
  actionBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.status.danger,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: colors.neutral.pureWhite,
  },
  actionBadgeText: {
    color: colors.neutral.pureWhite,
    fontSize: 12,
    fontWeight: "700",
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
    color: colors.status.danger,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: colors.primary.yellow,
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
  gpsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
  },
  gpsInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  gpsTextContainer: {
    flex: 1,
  },
  gpsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  gpsStatus: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  gpsErrorText: {
    fontSize: 12,
    color: colors.status.danger,
    marginTop: 2,
  },
});
