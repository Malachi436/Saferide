import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapContainer, LiquidCard } from '../components';
import { useAttendanceStore } from '../stores/attendanceStore';

export const LiveTrackingScreen = () => {
  const { activeTrip } = useAttendanceStore();

  return (
    <View style={styles.container}>
      <MapContainer
        height={400}
        showsUserLocation
        markers={[
          {
            id: 'bus',
            coordinate: { latitude: 37.7749, longitude: -122.4194 },
            title: 'School Bus',
            description: activeTrip?.route || 'Route A',
          },
        ]}
      />

      <View style={styles.info}>
        <LiquidCard>
          <Text style={styles.title}>Live Bus Location</Text>
          <Text style={styles.route}>
            {activeTrip?.route || 'Route A - Morning'}
          </Text>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>ETA</Text>
              <Text style={styles.statValue}>8 mins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>2.4 km</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Next Stop</Text>
              <Text style={styles.statValue}>Main St</Text>
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
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
});
