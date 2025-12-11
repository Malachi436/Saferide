/**
 * Live Tracking Screen
 * Real-time tracking of children and bus location with WebSocket GPS updates
 * Uses SocketContext for persistent connection across app navigation
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Linking, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { useAuthStore } from "../../stores/authStore";
import { apiClient } from "../../utils/api";
import { socketService } from "../../utils/socket";
import { useSocket } from "../../context/SocketContext";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  homeLatitude?: number;
  homeLongitude?: number;
  pickupDescription?: string;
  homeAddress?: string;
  school?: { name: string; latitude?: number; longitude?: number };
}

interface TripInfo {
  id: string;
  status: string;
  bus: {
    id: string;
    plateNumber: string;
    driver?: {
      user?: {
        firstName: string;
        lastName: string;
        phone?: string;
      };
    };
  };
  route?: { name: string };
}

interface BusLocation {
  busId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp?: string;
}

// Calculate distance in km using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate ETA based on distance and average speed (default 30 km/h in city)
function calculateETA(distanceKm: number, speedKmh: number = 30): string {
  if (distanceKm < 0.1) return "Arriving";
  const timeMinutes = Math.round((distanceKm / speedKmh) * 60);
  if (timeMinutes < 1) return "< 1 min";
  if (timeMinutes === 1) return "1 min";
  return `${timeMinutes} mins`;
}

export default function LiveTrackingScreen() {
  const user = useAuthStore((s) => s.user);
  const mapRef = useRef<MapView>(null);
  const { isConnected: socketConnected, busLocations, subscribeToBus, unsubscribeFromBus, reconnect } = useSocket();
  
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [trip, setTrip] = useState<TripInfo | null>(null);
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Get selected child
  const selectedChild = selectedChildId 
    ? children.find(c => c.id === selectedChildId) 
    : children[0];

  // Get pickup location for selected child - ALWAYS use stored home location, never device location
  // This ensures ETA is calculated to the child's home, not where the device currently is
  const getStoredHomeLocation = useCallback((child: Child | undefined): { latitude: number; longitude: number } | null => {
    if (!child) return null;
    
    // First priority: stored pickup coordinates
    if (child.pickupLatitude && child.pickupLongitude) {
      console.log('[LiveTracking] Using stored pickup location:', child.pickupLatitude, child.pickupLongitude);
      return {
        latitude: child.pickupLatitude,
        longitude: child.pickupLongitude,
      };
    }
    
    // Second priority: stored home coordinates
    if (child.homeLatitude && child.homeLongitude) {
      console.log('[LiveTracking] Using stored home location:', child.homeLatitude, child.homeLongitude);
      return {
        latitude: child.homeLatitude,
        longitude: child.homeLongitude,
      };
    }
    
    // No stored location - return null (don't fallback to device location)
    console.log('[LiveTracking] No stored home location for child:', child.id);
    return null;
  }, []);

  const pickupLocation = getStoredHomeLocation(selectedChild);

  // Calculate distance and ETA - only if we have a stored home location
  const hasStoredLocation = pickupLocation !== null;
  
  const distance = busLocation && pickupLocation 
    ? calculateDistance(busLocation.latitude, busLocation.longitude, pickupLocation.latitude, pickupLocation.longitude)
    : null;
  
  // Show "Set Home" instead of ETA if no home location is stored
  const eta = !hasStoredLocation
    ? "Set Home"
    : distance !== null 
      ? calculateETA(distance, busLocation?.speed || 30) 
      : "--";

  const distanceText = !hasStoredLocation
    ? "--"
    : distance !== null 
      ? distance < 1 
        ? `${Math.round(distance * 1000)} m` 
        : `${distance.toFixed(1)} km`
      : "--";

  // Driver info
  const driver = trip?.bus?.driver?.user;
  const driverName = driver ? `${driver.firstName} ${driver.lastName}` : "No driver assigned";
  const driverPhone = driver?.phone || "";
  
  const handleCallDriver = async () => {
    if (!driverPhone) {
      Alert.alert("Error", "Driver phone number not available");
      return;
    }
  
    try {
      const phoneUrl = `tel:${driverPhone.replace(/\D/g, '')}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert("Error", "Cannot initiate phone call on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Could not place call");
      console.error("Error calling driver:", error);
    }
  };

  // Fetch children and trip data
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch parent's children
      const childrenResponse = await apiClient.get<Child[]>(`/children/parent/${user.id}`);
      const childrenList = Array.isArray(childrenResponse) ? childrenResponse : [];
      setChildren(childrenList);
      console.log('[LiveTracking] Fetched children:', childrenList.length);
      
      if (childrenList.length > 0) {
        // Set first child as selected
        if (!selectedChildId) {
          setSelectedChildId(childrenList[0].id);
        }
        
        // Fetch trip for the first child
        try {
          const tripResponse = await apiClient.get<TripInfo>(`/trips/child/${childrenList[0].id}`);
          setTrip(tripResponse);
          console.log('[LiveTracking] Fetched trip:', tripResponse);
        } catch (tripErr: any) {
          console.log('[LiveTracking] No active trip for child');
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to load data';
      console.error('[LiveTracking] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, selectedChildId]);

  // Subscribe to bus room via SocketContext and update local bus location
  useEffect(() => {
    if (trip?.bus?.id) {
      console.log('[LiveTracking] Subscribing to bus via context:', trip.bus.id);
      subscribeToBus(trip.bus.id);
      setIsConnected(socketConnected);
    }

    return () => {
      if (trip?.bus?.id) {
        unsubscribeFromBus(trip.bus.id);
      }
    };
  }, [trip?.bus?.id, subscribeToBus, unsubscribeFromBus, socketConnected]);

  // Update local bus location from context's busLocations
  useEffect(() => {
    if (trip?.bus?.id && busLocations[trip.bus.id]) {
      const location = busLocations[trip.bus.id];
      console.log('[LiveTracking] Bus location from context:', location);
      setBusLocation(location);
      
      // Animate map to show bus
      if (mapRef.current && location.latitude && location.longitude) {
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 500);
      }
    }
  }, [trip?.bus?.id, busLocations]);

  // Update connection status from context
  useEffect(() => {
    setIsConnected(socketConnected);
  }, [socketConnected]);

  // Listen for attendance updates via socketService (still needed for alerts)
  useEffect(() => {
    const handleAttendanceUpdate = (data: any) => {
      console.log('[LiveTracking] Attendance update received:', data);
      
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

      // Refresh data
      fetchData();
    };

    socketService.on('attendance_updated', handleAttendanceUpdate);

    return () => {
      socketService.off('attendance_updated', handleAttendanceUpdate);
    };
  }, [fetchData]);

  // Fetch data when screen focuses
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Initial map region
  const initialRegion: Region = {
    latitude: busLocation?.latitude || pickupLocation?.latitude || 5.6037,
    longitude: busLocation?.longitude || pickupLocation?.longitude || -0.187,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.blue} />
        <Text style={styles.loadingText}>Loading tracking data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color={colors.accent.sunsetOrange} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (children.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="people" size={48} color={colors.neutral.textSecondary} />
        <Text style={styles.errorText}>No children registered</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
      >
        {/* Bus Location Marker */}
        {busLocation && (
          <Marker
            coordinate={{
              latitude: busLocation.latitude,
              longitude: busLocation.longitude,
            }}
            title="School Bus"
            description={`Driver: ${driverName}`}
          >
            <View style={styles.busMarker}>
              <Ionicons name="bus" size={24} color={colors.neutral.pureWhite} />
            </View>
          </Marker>
        )}

        {/* Child Pickup Location Marker */}
        {pickupLocation && selectedChild && (
          <Marker
            coordinate={pickupLocation}
            title={`${selectedChild.firstName}'s Pickup`}
            description={selectedChild.pickupDescription || selectedChild.homeAddress || "Pickup Location"}
          >
            <View style={styles.childMarker}>
              <Ionicons name="location" size={24} color={colors.neutral.pureWhite} />
            </View>
          </Marker>
        )}

        {/* School Location Marker */}
        {selectedChild?.school?.latitude && selectedChild?.school?.longitude && (
          <Marker
            coordinate={{
              latitude: selectedChild.school.latitude,
              longitude: selectedChild.school.longitude,
            }}
            title={selectedChild.school.name}
            description="School"
          >
            <View style={styles.schoolMarker}>
              <Ionicons name="school" size={20} color={colors.neutral.pureWhite} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Connection Status Badge */}
      <View style={styles.connectionBadge}>
        <View style={[styles.connectionDot, { backgroundColor: isConnected ? colors.accent.successGreen : colors.accent.sunsetOrange }]} />
        <Text style={styles.connectionText}>
          {isConnected ? 'Live' : 'Connecting...'}
        </Text>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />

        {/* Child Selector */}
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
                      {(child.firstName || 'X')[0]}{(child.lastName || 'X')[0]}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.childChipText,
                      selectedChild?.id === child.id && styles.childChipTextActive,
                    ]}
                  >
                    {child.firstName || 'Child'}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        )}

        {/* Status Card with ETA and Distance */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <LiquidGlassCard intensity="heavy" className="mb-4">
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={styles.statusLeft}>
                  <Text style={styles.childName}>
                    {selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}` : 'No child selected'}
                  </Text>
                  <View style={styles.statusBadge}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: busLocation 
                            ? colors.accent.successGreen 
                            : colors.status.warningYellow,
                        },
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {busLocation ? "Bus is on the way" : "Waiting for bus"}
                    </Text>
                  </View>
                </View>
                <View style={styles.etaContainer}>
                  <Text style={styles.etaLabel}>ETA</Text>
                  <Text style={styles.etaValue}>{eta}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Distance and Bus Info Row */}
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="navigate" size={16} color={colors.primary.blue} />
                  <Text style={styles.infoLabel}>Distance</Text>
                  <Text style={styles.infoValue}>{distanceText}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="bus" size={16} color={colors.primary.teal} />
                  <Text style={styles.infoLabel}>Bus</Text>
                  <Text style={styles.infoValue}>{trip?.bus?.plateNumber || "--"}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="speedometer" size={16} color={colors.accent.sunsetOrange} />
                  <Text style={styles.infoLabel}>Speed</Text>
                  <Text style={styles.infoValue}>
                    {busLocation?.speed ? `${Math.round(busLocation.speed)} km/h` : "--"}
                  </Text>
                </View>
              </View>
            </View>
          </LiquidGlassCard>
        </Animated.View>

        {/* Driver Info */}
        {driver && (
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <LiquidGlassCard intensity="medium">
              <View style={styles.driverCard}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>
                    {(driver.firstName || 'D')[0]}{(driver.lastName || 'R')[0]}
                  </Text>
                </View>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverLabel}>Your Driver</Text>
                  <Text style={styles.driverName}>{driverName}</Text>
                  {driverPhone && <Text style={styles.driverPhone}>{driverPhone}</Text>}
                </View>
                {driverPhone && (
                  <Pressable style={styles.callButton} onPress={handleCallDriver}>
                    <Ionicons name="call" size={20} color={colors.neutral.pureWhite} />
                  </Pressable>
                )}
              </View>
            </LiquidGlassCard>
          </Animated.View>
        )}

        {/* No Trip Message */}
        {!trip && (
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <LiquidGlassCard intensity="medium">
              <View style={styles.noTripCard}>
                <Ionicons name="calendar-outline" size={32} color={colors.neutral.textSecondary} />
                <Text style={styles.noTripText}>No active trip today</Text>
                <Text style={styles.noTripSubtext}>Check back when a trip is scheduled</Text>
              </View>
            </LiquidGlassCard>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.creamWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.neutral.creamWhite,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.neutral.creamWhite,
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.neutral.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: colors.primary.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.neutral.pureWhite,
    fontWeight: "600",
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
  schoolMarker: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primary.teal,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.neutral.pureWhite,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  connectionBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    color: colors.neutral.pureWhite,
    fontSize: 12,
    fontWeight: "600",
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  infoItem: {
    alignItems: "center",
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.neutral.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
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
  noTripCard: {
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  noTripText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  noTripSubtext: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
});
