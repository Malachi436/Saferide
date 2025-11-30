/**
 * Live Tracking Screen
 * Real-time tracking of children and bus location
 */

import React, { useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { apiClient } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";
import { Child, Trip, BusLocation } from "../../types";

export default function LiveTrackingScreen() {
  const { user } = useAuthStore();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch children and today's trip
  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch children
      const childrenResponse = await apiClient.get<Child[]>(
        `/children/parent/${user.id}`
      );
      const childrenData = Array.isArray(childrenResponse) ? childrenResponse : [];
      setChildren(childrenData);
      console.log('[LiveTracking] Fetched children:', childrenData);

      // Fetch today's trips for first child
      if (childrenData.length > 0) {
        try {
          const tripResponse = await apiClient.get<Trip>(
            `/trips/child/${childrenData[0].id}`
          );
          setTrip(tripResponse as Trip);
          console.log('[LiveTracking] Found active trip:', tripResponse);

          // Fetch bus location only if trip is still active (not completed)
          const tripStatus = (tripResponse as Trip)?.status;
          if (tripStatus && ['IN_PROGRESS', 'ARRIVED_SCHOOL', 'RETURN_IN_PROGRESS'].includes(tripStatus)) {
            try {
              const locationResponse = await apiClient.get<BusLocation>(
                `/gps/location/${(tripResponse as Trip)?.busId}`
              );
              setBusLocation(locationResponse as BusLocation);
              console.log('[LiveTracking] Fetched bus location:', locationResponse);
            } catch (locErr) {
              console.log('[LiveTracking] Failed to fetch bus location:', locErr);
            }
          } else {
            // Trip is completed - disable tracking for security
            setBusLocation(null);
            console.log('[LiveTracking] Trip status prevents tracking:', tripStatus);
          }
        } catch (tripErr: any) {
          setTrip(null);
          setBusLocation(null);
          console.log('[LiveTracking] No active trip found');
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to load tracking data';
      setError(errorMsg);
      console.error('[LiveTracking] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Poll for location updates every 5 seconds (only if trip is active and not completed)
  useEffect(() => {
    if (!trip?.busId || !['IN_PROGRESS', 'ARRIVED_SCHOOL', 'RETURN_IN_PROGRESS'].includes(trip?.status as string)) return;

    const interval = setInterval(async () => {
      try {
        const locationResponse = await apiClient.get<BusLocation>(
          `/gps/location/${trip.busId}`
        );
        setBusLocation(locationResponse as BusLocation);
      } catch (err) {
        console.log('[LiveTracking] Poll error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [trip?.busId, trip?.status]);

  const selectedChild = children[0]; // Always show first child's tracking

  const initialRegion = {
    latitude: selectedChild?.pickupLocation?.latitude || 5.6037,
    longitude: selectedChild?.pickupLocation?.longitude || -0.187,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  // Security: Check if tracking should be allowed
  const isTripActive = trip && ['IN_PROGRESS', 'ARRIVED_SCHOOL', 'RETURN_IN_PROGRESS'].includes(trip.status);
  const canTrack = isTripActive && busLocation;

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary.blue} />
      </View>
    );
  }

  if (error || !selectedChild) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>{error || 'No children found'}</Text>
        <Pressable onPress={fetchData}>
          <Text>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
      >
        {/* Bus Location - Only show if trip is still active */}
        {canTrack && busLocation && (
          <Marker
            coordinate={{
              latitude: busLocation.latitude,
              longitude: busLocation.longitude,
            }}
            title="School Bus"
          >
            <View style={styles.busMarker}>
              <Ionicons name="bus" size={24} color={colors.neutral.pureWhite} />
            </View>
          </Marker>
        )}

        {/* Child Pickup Location - Default Accra location */}
        {selectedChild && (
          <Marker
            coordinate={{
              latitude: 5.6037,
              longitude: -0.187,
            }}
            title={`${selectedChild.firstName} ${selectedChild.lastName}`}
            description="School pickup area (Accra)"
          >
            <View style={styles.childMarker}>
              <Ionicons name="location" size={24} color={colors.neutral.pureWhite} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />

        {/* Child Selector - Remove if only one child */}
        {children.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.childSelector}
            contentContainerStyle={styles.childSelectorContent}
          >
            {children.map((child, index) => (
              <Animated.View
                key={child.id}
                entering={FadeInDown.delay(100 + index * 50).springify()}
              >
                <Pressable
                  onPress={() => setSelectedChildId(child.id)}
                  style={[
                    styles.childChip,
                    selectedChild?.id === child.id && styles.childChipActive,
                  ]}
                >
                  <View
                    style={[
                      styles.childChipAvatar,
                      selectedChild?.id === child.id && styles.childChipAvatarActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.childChipAvatarText,
                        selectedChild?.id === child.id && styles.childChipAvatarTextActive,
                      ]}
                    >
                      {`${child.firstName[0]}${child.lastName[0]}`.toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.childChipText,
                      selectedChild?.id === child.id && styles.childChipTextActive,
                    ]}
                  >
                    {child.firstName}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        )}

        {/* Status Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <LiquidGlassCard intensity="heavy" className="mb-4">
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={styles.statusLeft}>
                  <Text style={styles.childName}>{selectedChild?.firstName} {selectedChild?.lastName}</Text>
                  <View style={styles.statusBadge}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            selectedChild?.status === "on_board"
                              ? colors.accent.successGreen
                              : colors.status.warningYellow,
                        },
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {selectedChild?.status === "on_board" ? "On the bus" : "Waiting for pickup"}
                    </Text>
                  </View>
                </View>
                <View style={styles.etaContainer}>
                  <Text style={styles.etaLabel}>ETA</Text>
                  <Text style={styles.etaValue}>--</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.locationInfo}>
                <Ionicons name="location" size={16} color={colors.neutral.textSecondary} />
                <Text style={styles.addressText} numberOfLines={2}>
                  Accra, Ghana (School pickup area)
                </Text>
              </View>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Driver Info */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <LiquidGlassCard intensity="medium">
            <View style={styles.driverCard}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverAvatarText}>
                  --
                </Text>
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverLabel}>Driver Info</Text>
                <Text style={styles.driverName}>--</Text>
                <Text style={styles.driverPhone}>--</Text>
              </View>
              <Pressable style={styles.callButton}>
                <Ionicons name="call" size={20} color={colors.neutral.pureWhite} />
              </Pressable>
            </View>
          </LiquidGlassCard>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.creamWhite,
  },
  map: {
    flex: 1,
  },
  busMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent.sunsetOrange,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.neutral.pureWhite,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  childMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.blue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.neutral.pureWhite,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral.pureWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: "55%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.neutral.textSecondary + "40",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  childSelector: {
    marginBottom: 16,
  },
  childSelectorContent: {
    gap: 12,
  },
  childChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.neutral.creamWhite,
    gap: 8,
  },
  childChipActive: {
    backgroundColor: colors.primary.blue,
  },
  childChipAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.blue + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  childChipAvatarActive: {
    backgroundColor: colors.neutral.pureWhite + "30",
  },
  childChipAvatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary.blue,
  },
  childChipAvatarTextActive: {
    color: colors.neutral.pureWhite,
  },
  childChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  childChipTextActive: {
    color: colors.neutral.pureWhite,
  },
  statusCard: {
    padding: 16,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  statusLeft: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  etaContainer: {
    alignItems: "flex-end",
  },
  etaLabel: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
    marginBottom: 2,
  },
  etaValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary.blue,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.textSecondary + "20",
    marginVertical: 12,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral.textSecondary,
    lineHeight: 20,
  },
  driverCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.teal + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  driverAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary.teal,
  },
  driverInfo: {
    flex: 1,
  },
  driverLabel: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
    marginBottom: 2,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
    marginBottom: 2,
  },
  driverPhone: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.blue,
    alignItems: "center",
    justifyContent: "center",
  },
});
