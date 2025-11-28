/**
 * Route Map Screen
 * Display route map with stops and navigation
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { mockTrip, mockRoutes, mockChildren } from "../../mock/data";

export default function RouteMapScreen() {
  const [selectedStop, setSelectedStop] = useState<string | null>(null);

  // TODO: Replace with actual API call
  const trip = mockTrip;
  const route = mockRoutes.find((r) => r.id === trip.routeId);
  const childrenOnTrip = mockChildren.filter((c) => trip.childIds.includes(c.id));

  if (!route) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="map-outline" size={64} color={colors.neutral.textSecondary} />
          <Text style={styles.emptyText}>No route available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const coordinates = route.stops.map((stop) => ({
    latitude: stop.location.latitude,
    longitude: stop.location.longitude,
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
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Route Polyline */}
        <Polyline
          coordinates={coordinates}
          strokeColor={colors.primary.blue}
          strokeWidth={4}
        />

        {/* Stop Markers */}
        {route.stops.map((stop, index) => (
          <Marker
            key={stop.id}
            coordinate={{
              latitude: stop.location.latitude,
              longitude: stop.location.longitude,
            }}
            title={`Stop ${index + 1}`}
            description={stop.location.address}
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
          {route.stops.map((stop, index) => {
            const childrenAtStop = childrenOnTrip.filter((c) =>
              stop.childIds.includes(c.id)
            );

            return (
              <View
                key={stop.id}
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
                        {stop.location.address}
                      </Text>
                      <View style={styles.stopMeta}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={colors.neutral.textSecondary}
                        />
                        <Text style={styles.stopTime}>{stop.estimatedArrivalTime}</Text>
                        <View style={styles.childrenCount}>
                          <Ionicons
                            name="people"
                            size={14}
                            color={colors.primary.blue}
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
                          stop.location.latitude,
                          stop.location.longitude,
                          stop.location.address || "Stop"
                        )
                      }
                      style={styles.navigateButton}
                    >
                      <Ionicons
                        name="navigate"
                        size={20}
                        color={colors.primary.blue}
                      />
                    </Pressable>
                  </View>
                </LiquidGlassCard>
              </View>
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
    backgroundColor: colors.neutral.creamWhite,
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
    backgroundColor: colors.primary.blue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.neutral.pureWhite,
  },
  startMarker: {
    backgroundColor: colors.accent.successGreen,
  },
  endMarker: {
    backgroundColor: colors.status.dangerRed,
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
    backgroundColor: colors.primary.blue + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  stopNumberStart: {
    backgroundColor: colors.accent.successGreen,
  },
  stopNumberEnd: {
    backgroundColor: colors.status.dangerRed,
  },
  stopNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary.blue,
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
    backgroundColor: colors.primary.blue + "20",
    borderRadius: 10,
  },
  childrenCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary.blue,
  },
  navigateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.blue + "20",
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
});
