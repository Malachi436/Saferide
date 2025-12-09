/**
 * Home Pickup Map Screen
 * Allows parent to select and set home pickup location
 */

import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../theme";
import { LargeCTAButton } from "../../components/ui/LargeCTAButton";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { apiClient } from "../../utils/api";
import { useAuthStore } from "../../stores/authStore";

type Props = NativeStackScreenProps<ParentStackParamList, "SetHomePickup">;

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export default function HomePickupMapScreen({ navigation, route }: Props) {
  const user = useAuthStore((s) => s.user);
  const { childId } = route.params || {};
  
  const mapRef = useRef<MapView>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoords | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getLocationPermissionAndInitialize();
  }, []);

  const getLocationPermissionAndInitialize = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need location permission to set your home pickup location",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords: LocationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(coords);
      setSelectedLocation(coords);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Could not get your current location");
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapPress = (event: any) => {
    const newLocation: LocationCoords = {
      latitude: event.nativeEvent.coordinate.latitude,
      longitude: event.nativeEvent.coordinate.longitude,
    };
    setSelectedLocation(newLocation);
  };

  const handleCurrentLocationPress = async () => {
    if (currentLocation) {
      setSelectedLocation(currentLocation);
      mapRef.current?.animateToRegion(
        {
          ...currentLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedLocation) {
      Alert.alert("Error", "Please select a location");
      return;
    }

    if (!childId) {
      Alert.alert("Error", "Child ID not found");
      return;
    }

    setIsSaving(true);

    try {
      await apiClient.patch(`/children/${childId}`, {
        homeLatitude: selectedLocation.latitude,
        homeLongitude: selectedLocation.longitude,
      });

      Alert.alert("Success", "Home pickup location saved successfully");
      navigation.goBack();
    } catch (error: any) {
      console.error("Error saving location:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save location"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.blue} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={
            selectedLocation
              ? {
                  ...selectedLocation,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
              : undefined
          }
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title="Home Pickup Location"
              description="Press 'Save Location' to confirm"
            >
              <View style={styles.markerContainer}>
                <Ionicons name="home" size={24} color={colors.neutral.pureWhite} />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Center Crosshair */}
        <View style={styles.centerMarker}>
          <View style={styles.crosshair} />
        </View>

        {/* Location Actions */}
        <View style={styles.bottomActions}>
          <Pressable
            style={styles.locationButton}
            onPress={handleCurrentLocationPress}
          >
            <Ionicons name="locate" size={20} color={colors.primary.blue} />
          </Pressable>

          <View style={styles.locationInfo}>
            {selectedLocation && (
              <Text style={styles.locationText} numberOfLines={1}>
                📍 {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.instructionText}>
          Tap on the map to select your home pickup location, or use your current location
        </Text>

        <LargeCTAButton
          title={isSaving ? "Saving..." : "Save Location"}
          onPress={handleSaveLocation}
          disabled={isSaving || !selectedLocation}
          variant="success"
          style={styles.submitButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.creamWhite,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral.creamWhite,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  centerMarker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 50,
    height: 50,
    marginTop: -25,
    marginLeft: -25,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  crosshair: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: colors.primary.blue,
    borderRadius: 20,
    opacity: 0.6,
  },
  bottomActions: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral.pureWhite,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  locationInfo: {
    flex: 1,
    backgroundColor: colors.neutral.pureWhite,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  locationText: {
    fontSize: 12,
    color: colors.neutral.textPrimary,
    fontWeight: "500",
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.blue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.neutral.pureWhite,
  },
  footer: {
    padding: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    backgroundColor: colors.neutral.pureWhite,
  },
  instructionText: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: 0,
  },
});
