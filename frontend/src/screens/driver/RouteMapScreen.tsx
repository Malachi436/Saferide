/**
 * Route Map Screen
 * Display route map with stops and navigation
 */

import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from "react-native-maps";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { useAuthStore } from "../../stores/authStore";
import { apiClient } from "../../utils/api";

export default function RouteMapScreen() {
  const user = useAuthStore((s) => s.user);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);

  const fetchTodayTrip = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) return;

      const response = await apiClient.get<any>(`/drivers/${user.id}/today-trip`);
      setTrip(response);
    } catch (err: any) {
      console.log('[RouteMapScreen] Error fetching trip:', err);
      setError(err.message || 'Failed to load route');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTodayTrip();
    }, [user?.id])
  );

  const route = trip?.route;
  const childrenOnTrip = trip?.attendances || [];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.yellow} />
          <Text style={styles.loadingText}>Loading route...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !route) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="map-outline" size={64} color={colors.neutral.textSecondary} />
          <Text style={styles.emptyText}>{error || 'No route available'}</Text>
          {error && (
            <Pressable style={styles.retryButton} onPress={fetchTodayTrip}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const coordinates = route.stops.map((stop: any) => ({
    latitude: stop.latitude,
    longitude: stop.longitude,
  }));

  const initialRegion = {
    latitude: coordinates[0]?.latitude || 5.6037,
    longitude: coordinates[0]?.longitude || -0.187,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const openNavigation = (latitude: number, longitude: number, address: string) => {
    const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
    const latLng = `${latitude},${longitude}`;
    const label = address;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Route Polyline */}
        <Polyline
          coordinates={coordinates}
          strokeColor={colors.primary.yellow}
          strokeWidth={4}
        />

        {/* Stop Markers */}
        {route.stops.map((stop: any, index: number) => (
          <Marker
            key={stop.id}
            coordinate={{
              latitude: stop.latitude,
              longitude: stop.longitude,
            }}
            title={`Stop ${index + 1}`}
            description={stop.name}
            onPress={() => setSelectedStop(stop.id)}
          >
            <View style={styles.markerContainer}>
              <View
                style={[
                  styles.marker,
                  index === 0 && styles.startMarker,
                  index === route.stops.length - 1 && styles.endMarker,
                ]}
              >
                <Text style={styles.markerText}>{index + 1}</Text>
              </View>
            </View>
          </Marker>
        ))}

        {/* Children Home Location Markers */}
        {childrenOnTrip.map((attendance: any) => {
          const child = attendance.child;
          if (child?.homeLatitude && child?.homeLongitude) {
            return (
              <Marker
                key={`child-${child.id}`}
                coordinate={{
                  latitude: child.homeLatitude,
                  longitude: child.homeLongitude,
                }}
                title={`${child.firstName} ${child.lastName}`}
                description={child.homeAddress || "Child's Home"}
              >
                <View style={styles.childHomeMarker}>
                  <Ionicons name="home" size={20} color={colors.neutral.pureWhite} />
                </View>
              </Marker>
            );
          }
          return null;
        })}

        {/* Current Location Marker */}
        {trip.currentLocation && (
          <Marker
            coordinate={{
              latitude: trip.currentLocation.latitude,
              longitude: trip.currentLocation.longitude,
            }}
            title="Current Location"
          >
            <View style={styles.busMarker}>
              <Ionicons name="bus" size={24} color={colors.neutral.pureWhite} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Bottom Sheet with Stops */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>{route.name}</Text>
        <Text style={styles.sheetSubtitle}>{route.stops.length} stops</Text>

        <ScrollView
          style={styles.stopsList}
          contentContainerStyle={styles.stopsContent}
          showsVerticalScrollIndicator={false}
        >
          {route.stops.map((stop: any, index: number) => {
            // For now, show total children on trip
            // In future, this could be enhanced to show children per stop
            const childrenAtStop = childrenOnTrip.length > 0 ? childrenOnTrip : [];

            return (
              <Animated.View
                key={stop.id}
                entering={FadeInDown.delay(100 + index * 50).springify()}
                style={styles.stopItem}
              >
                <LiquidGlassCard intensity="medium">
                  <View style={styles.stopCard}>
                    {/* Stop Number */}
                    <View
                      style={[
                        styles.stopNumber,
                        index === 0 && styles.stopNumberStart,
                        index === route.stops.length - 1 && styles.stopNumberEnd,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stopNumberText,
                          (index === 0 || index === route.stops.length - 1) &&
                            styles.stopNumberTextWhite,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>

                    {/* Stop Info */}
                    <View style={styles.stopInfo}>
                      <Text style={styles.stopAddress} numberOfLines={2}>
                        {stop.name}
                      </Text>
                      <View style={styles.stopMeta}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={colors.neutral.textSecondary}
                        />
                        <Text style={styles.stopTime}>Stop {index + 1}</Text>
                        <View style={styles.childrenCount}>
                          <Ionicons
                            name="people"
                            size={14}
                            color={colors.primary.yellow}
                          />
                          <Text style={styles.childrenCountText}>
                            {childrenAtStop.length}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Navigate Button */}
                    <Pressable
                      onPress={() =>
                        openNavigation(
                          stop.latitude,
                          stop.longitude,
                          stop.name || "Stop"
                        )
                      }
                      style={styles.navigateButton}
                    >
                      <Ionicons
                        name="navigate"
                        size={20}
                        color={colors.primary.yellow}
                      />
                    </Pressable>
                  </View>
                </LiquidGlassCard>
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.warmCream,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.yellow,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.neutral.pureWhite,
  },
  startMarker: {
    backgroundColor: colors.status.success,
  },
  endMarker: {
    backgroundColor: colors.status.danger,
  },
  markerText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
  },
  busMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent.safetyOrange,
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
  childHomeMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent.safetyOrange,
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
    maxHeight: "50%",
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
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    marginBottom: 16,
  },
  stopsList: {
    flex: 1,
  },
  stopsContent: {
    paddingBottom: 20,
  },
  stopItem: {
    marginBottom: 12,
  },
  stopCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  stopNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.yellow + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  stopNumberStart: {
    backgroundColor: colors.status.success,
  },
  stopNumberEnd: {
    backgroundColor: colors.status.danger,
  },
  stopNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary.yellow,
  },
  stopNumberTextWhite: {
    color: colors.neutral.pureWhite,
  },
  stopInfo: {
    flex: 1,
    gap: 6,
  },
  stopAddress: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  stopMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stopTime: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  childrenCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: colors.primary.yellow + "20",
    borderRadius: 10,
  },
  childrenCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary.yellow,
  },
  navigateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.yellow + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.neutral.textSecondary,
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.neutral.textSecondary,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.primary.yellow,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.neutral.pureWhite,
    fontWeight: "600",
    fontSize: 14,
  },
});
