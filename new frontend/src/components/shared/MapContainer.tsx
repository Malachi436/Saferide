/**
 * MapContainer Component
 * Reusable map component with Mapbox/Google Maps integration
 * Displays bus location, route, and pickup points
 */

import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Linking, Platform } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";
import { Location, RouteStop } from "../../types/models";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";

interface MapContainerProps {
  busLocation: Location;
  stops?: RouteStop[];
  routeCoordinates?: Location[];
  driverName?: string;
  driverPhone?: string;
  eta?: string;
  children?: React.ReactNode;
  onMarkerPress?: (stopId: string) => void;
}

export function MapContainer({
  busLocation,
  stops = [],
  routeCoordinates = [],
  driverName,
  driverPhone,
  eta,
  children,
  onMarkerPress,
}: MapContainerProps) {
  const mapRef = useRef<MapView>(null);

  // Center map on bus location when it changes
  useEffect(() => {
    if (mapRef.current && busLocation) {
      mapRef.current.animateToRegion({
        latitude: busLocation.latitude,
        longitude: busLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [busLocation]);

  const handleCallDriver = () => {
    if (driverPhone) {
      Linking.openURL(`tel:${driverPhone}`);
    }
  };

  const handleNavigate = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${busLocation.latitude},${busLocation.longitude}`,
      android: `geo:0,0?q=${busLocation.latitude},${busLocation.longitude}`,
    });
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: busLocation.latitude,
          longitude: busLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Route polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={colors.primary.yellow}
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}

        {/* Bus marker (animated pulsing) */}
        <Marker
          coordinate={{
            latitude: busLocation.latitude,
            longitude: busLocation.longitude,
          }}
          title="School Bus"
          description={driverName}
        >
          <View style={styles.busMarker}>
            <View style={styles.busMarkerPulse} />
            <View style={styles.busMarkerInner}>
              <Ionicons name="bus" size={24} color={colors.neutral.pureWhite} />
            </View>
          </View>
        </Marker>

        {/* Stop markers */}
        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            coordinate={{
              latitude: stop.location.latitude,
              longitude: stop.location.longitude,
            }}
            onPress={() => onMarkerPress?.(stop.id)}
          >
            <View style={styles.stopMarker}>
              <Text style={styles.stopMarkerText}>{index + 1}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Top info panel */}
      {(driverName || eta) && (
        <View style={styles.topPanel}>
          <LiquidGlassCard intensity="medium" className="w-full">
            <View style={styles.infoPanelContent}>
              {driverName && (
                <View style={styles.driverInfo}>
                  <View style={styles.driverAvatar}>
                    <Ionicons name="person" size={20} color={colors.primary.yellow} />
                  </View>
                  <View style={styles.driverDetails}>
                    <Text style={styles.driverName}>{driverName}</Text>
                    {driverPhone && (
                      <Pressable onPress={handleCallDriver}>
                        <Text style={styles.driverPhone}>
                          <Ionicons name="call" size={12} /> {driverPhone}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              )}
              {eta && (
                <View style={styles.etaChip}>
                  <Ionicons name="time" size={14} color={colors.status.success} />
                  <Text style={styles.etaText}>{eta}</Text>
                </View>
              )}
            </View>
          </LiquidGlassCard>
        </View>
      )}

      {/* Navigate button */}
      <View style={styles.bottomActions}>
        <Pressable style={styles.navigateButton} onPress={handleNavigate}>
          <Ionicons name="navigate" size={20} color={colors.neutral.pureWhite} />
          <Text style={styles.navigateText}>Navigate</Text>
        </Pressable>
      </View>

      {/* Custom children overlay */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  topPanel: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  infoPanelContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.warmCream,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.textPrimary,
  },
  driverPhone: {
    fontSize: 12,
    color: colors.primary.yellow,
    marginTop: 2,
  },
  etaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.status.success + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  etaText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.status.success,
  },
  busMarker: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  busMarkerPulse: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.yellow + "30",
  },
  busMarkerInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.yellow,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  stopMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.safetyOrange,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.neutral.pureWhite,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  stopMarkerText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral.pureWhite,
  },
  bottomActions: {
    position: "absolute",
    bottom: 24,
    right: 16,
    zIndex: 10,
  },
  navigateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.yellow,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  navigateText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral.pureWhite,
  },
});
