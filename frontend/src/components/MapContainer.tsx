import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Location } from '../types';

interface MapContainerProps {
  location?: Location;
  markers?: Array<{
    id: string;
    coordinate: Location;
    title?: string;
    description?: string;
  }>;
  height?: number;
  showsUserLocation?: boolean;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  location,
  markers = [],
  height = 300,
  showsUserLocation = false,
}) => {
  // Check if we have a valid location or markers
  const hasLocation = location || markers.length > 0;

  if (!hasLocation) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <Text style={styles.placeholderText}>Map Placeholder</Text>
        <Text style={styles.placeholderSubtext}>
          Location services will be available here
        </Text>
      </View>
    );
  }

  const initialRegion = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : markers.length > 0
    ? {
        latitude: markers[0].coordinate.latitude,
        longitude: markers[0].coordinate.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : undefined;

  try {
    return (
      <MapView
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={[styles.map, { height }]}
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={showsUserLocation}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
          />
        ))}
      </MapView>
    );
  } catch (error) {
    // Fallback if map fails to load
    return (
      <View style={[styles.placeholder, { height }]}>
        <Text style={styles.placeholderText}>Map Unavailable</Text>
        <Text style={styles.placeholderSubtext}>
          Please check Google Maps API configuration
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  placeholder: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
