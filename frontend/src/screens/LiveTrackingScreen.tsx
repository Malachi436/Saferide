import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapContainer, LiquidCard } from '../components';
import { useAttendanceStore } from '../stores/attendanceStore';
import { io } from 'socket.io-client';
import { Location } from '../types';

export const LiveTrackingScreen = () => {
  const { activeTrip } = useAttendanceStore();
  const [busLocation, setBusLocation] = useState<Location | null>(null);
  const [eta, setEta] = useState<string>('Calculating...');
  const [distance, setDistance] = useState<string>('0 km');
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    initializeSocket();
    return () => {
      socket?.disconnect();
    };
  }, [activeTrip?.id]);

  const initializeSocket = async () => {
    // Get auth token from AsyncStorage
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const token = await AsyncStorage.getItem('access_token');
    
    if (!token) {
      console.log('[LiveTracking] No auth token found, cannot connect socket');
      return;
    }

    // Connect to Socket.IO with authentication
    const newSocket = io('http://192.168.100.8:3000', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });

    newSocket.on('connect', () => {
      console.log('[LiveTracking] Connected to server');
    });

    // Listen for bus location updates
    newSocket.on('bus_location', (data: any) => {
      console.log('[LiveTracking] Received bus location:', data);
      setBusLocation({
        latitude: data.latitude,
        longitude: data.longitude,
      });
    });

    // Listen for location_update events (trip-specific)
    newSocket.on('location_update', (data: any) => {
      console.log('[LiveTracking] Location update:', data);
      if (data.busId === activeTrip?.id) {
        setBusLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
        // Calculate mock ETA and distance based on timestamp
        setEta(Math.floor(Math.random() * 10 + 5) + ' mins');
        setDistance((Math.random() * 3 + 0.5).toFixed(1) + ' km');
      }
    });

    newSocket.on('disconnect', () => {
      console.log('[LiveTracking] Disconnected from server');
    });

    setSocket(newSocket);
  };

  // Mock bus location if no real location yet
  const displayBusLocation = busLocation || {
    latitude: 5.603717,
    longitude: -0.186964,
  };

  return (
    <View style={styles.container}>
      <MapContainer
        height={400}
        showsUserLocation
        markers={[
          {
            id: 'bus',
            coordinate: displayBusLocation,
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
              <Text style={styles.statValue}>{eta}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{distance}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={styles.statValue}>Active</Text>
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
