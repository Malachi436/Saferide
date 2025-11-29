import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapContainer, LiquidCard } from '../components';
import { useAttendanceStore } from '../stores/attendanceStore';

export const RouteMapScreen = () => {
  const { children, activeTrip } = useAttendanceStore();

  const markers = children
    .filter(child => child.pickupLocation)
    .map(child => ({
      id: child.id,
      coordinate: {
        latitude: child.pickupLocation!.latitude,
        longitude: child.pickupLocation!.longitude,
      },
      title: child.name,
      description: `${child.school} - ${child.status}`,
    }));

  return (
    <View style={styles.container}>
      <MapContainer
        height={500}
        markers={markers}
        showsUserLocation
      />

      <View style={styles.info}>
        <LiquidCard>
          <Text style={styles.title}>Route Overview</Text>
          <Text style={styles.route}>{activeTrip?.route || 'Route A'}</Text>
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{markers.length}</Text>
              <Text style={styles.statLabel}>Stops</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {children.filter(c => c.status === 'waiting').length}
              </Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {children.filter(c => c.status === 'picked_up').length}
              </Text>
              <Text style={styles.statLabel}>On Board</Text>
            </View>
          </View>
        </LiquidCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  info: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  route: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});
