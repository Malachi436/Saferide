/**
 * Live Tracking Screen
 * Real-time tracking of children and bus location
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "../../theme";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { useAuthStore } from "../../state/authStore";

export default function LiveTrackingScreen() {
  const user = useAuthStore((s) => s.user);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // TODO: Implement real GPS tracking with API
  const trip = null;
  const driver = null;
  const userChildren = [];

  const selectedChild = null;

  // Calculate ETA (mock)
  const eta = "8 mins";

  const initialRegion = {
    latitude: selectedChild?.pickupLocation.latitude || 5.6037,
    longitude: selectedChild?.pickupLocation.longitude || -0.187,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
      >
        {/* Bus Location */}
        {trip.currentLocation && (
          <Marker
            coordinate={{
              latitude: trip.currentLocation.latitude,
              longitude: trip.currentLocation.longitude,
            }}
            title="School Bus"
            description={`Driver: ${driver.name}`}
          >
            <View style={styles.busMarker}>
              <Ionicons name="bus" size={24} color={colors.neutral.pureWhite} />
            </View>
          </Marker>
        )}

        {/* Child Pickup Location */}
        {selectedChild && (
          <Marker
            coordinate={{
              latitude: selectedChild.pickupLocation.latitude,
              longitude: selectedChild.pickupLocation.longitude,
            }}
            title={selectedChild.name}
            description="Pickup Location"
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

        {/* Child Selector */}
        {userChildren.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.childSelector}
            contentContainerStyle={styles.childSelectorContent}
          >
            {userChildren.map((child, index) => (
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
                      {child.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.childChipText,
                      selectedChild?.id === child.id && styles.childChipTextActive,
                    ]}
                  >
                    {child.name.split(" ")[0]}
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
                  <Text style={styles.childName}>{selectedChild?.name}</Text>
                  <View style={styles.statusBadge}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            selectedChild?.status === "picked_up"
                              ? colors.accent.successGreen
                              : colors.status.warningYellow,
                        },
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {selectedChild?.status === "picked_up" ? "On the bus" : "Waiting for pickup"}
                    </Text>
                  </View>
                </View>
                <View style={styles.etaContainer}>
                  <Text style={styles.etaLabel}>ETA</Text>
                  <Text style={styles.etaValue}>{eta}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.locationInfo}>
                <Ionicons name="location" size={16} color={colors.neutral.textSecondary} />
                <Text style={styles.addressText} numberOfLines={2}>
                  {selectedChild?.pickupLocation.address}
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
                  {driver.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Text>
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverLabel}>Your Driver</Text>
                <Text style={styles.driverName}>{driver.name}</Text>
                <Text style={styles.driverPhone}>{driver.phone}</Text>
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
