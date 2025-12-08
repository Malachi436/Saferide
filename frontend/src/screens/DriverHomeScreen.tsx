import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { useAttendanceStore } from '../stores/attendanceStore';
import { LiquidCard, LargeCTAButton } from '../components';
import { Ionicons } from '@expo/vector-icons';
import { gpsService } from '../services/gpsService';
import { apiClient } from '../utils/api';
import { Trip } from '../types';

export const DriverHomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { activeTrip, loadMockData } = useAttendanceStore();
  const [isTracking, setTracking] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [todayTrip, setTodayTrip] = useState<Trip | null>(null);

  useEffect(() => {
    loadMockData();
    fetchTodayTrip();
    initializeSocket();
    
    // Sync GPS state on mount
    const actualGPSState = gpsService.isTracking();
    if (actualGPSState !== isTracking) {
      setTracking(actualGPSState);
    }
    
    return () => {
      if (gpsService.isTracking()) {
        gpsService.stopTracking();
      }
      socket?.disconnect();
    };
  }, []);

  const initializeSocket = async () => {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const token = await AsyncStorage.getItem('access_token');
    
    if (!token) {
      console.log('[DriverHome] No auth token found');
      return;
    }

    const SOCKET_URL = __DEV__ ? 'http://192.168.100.8:3000' : 'http://192.168.100.8:3000';
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      upgrade: true,        // Upgrade polling to websocket
    });

    newSocket.on('connect', () => {
      console.log('[DriverHome] Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[DriverHome] Socket disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[DriverHome] Socket connect error:', error);
    });

    newSocket.on('error', (error) => {
      console.error('[DriverHome] Socket error:', error);
    });

    setSocket(newSocket);
  };

  const fetchTodayTrip = async () => {
    try {
      if (!user?.id) return;
      const response = await apiClient.get<Trip>(`/drivers/${user.id}/today-trip`);
      if (response) {
        console.log('[DriverHome] Today trip fetched:', response);
        setTodayTrip(response);
      }
    } catch (err: any) {
      console.log('[DriverHome] No trip found for today:', err.message);
    }
  };

  const tripData = todayTrip || activeTrip;
  const busId = todayTrip?.bus?.id || todayTrip?.busId || (activeTrip as any)?.id || 'unknown-bus';
  const displayRouteName = typeof todayTrip?.route === 'string' ? todayTrip.route : (todayTrip?.route as any)?.name || (activeTrip as any)?.route || 'Route A - Morning';
  const totalChildren = todayTrip?.attendances?.length || todayTrip?.totalChildren || (activeTrip as any)?.totalChildren || 4;
  const pickedUpCount = todayTrip?.attendances?.filter((a: any) => a.status === 'PICKED_UP').length || todayTrip?.pickedUp || (activeTrip as any)?.pickedUp || 2;
  const droppedOffCount = todayTrip?.attendances?.filter((a: any) => a.status === 'DROPPED_OFF').length || todayTrip?.droppedOff || (activeTrip as any)?.droppedOff || 0;
  const absentCount = todayTrip?.attendances?.filter((a: any) => a.status === 'ABSENT').length || todayTrip?.absent || (activeTrip as any)?.absent || 0;

  const toggleGPSTracking = useCallback(async () => {
    console.log('[DriverHome] GPS toggle pressed, current state:', isTracking);
    try {
      if (isTracking) {
        console.log('[DriverHome] Stopping GPS');
        gpsService.stopTracking();
        setTracking(false);
        setError(null);
        Alert.alert('GPS Stopped', 'Location tracking stopped');
      } else {
        console.log('[DriverHome] Starting GPS, socket:', socket?.id, 'connected:', socket?.connected);
        if (!socket) {
          console.error('[DriverHome] Socket is null');
          Alert.alert('Error', 'Connection not ready. Please wait.');
          return;
        }

        if (!socket.connected) {
          console.error('[DriverHome] Socket not connected');
          Alert.alert('Error', 'Not connected to server.');
          return;
        }
        
        console.log('[DriverHome] Emitting join_bus_room for busId:', busId);
        socket.emit('join_bus_room', { busId });
        
        try {
          console.log('[DriverHome] Calling gpsService.startTracking');
          await gpsService.startTracking(socket, busId, 5000);
          
          if (gpsService.isTracking()) {
            console.log('[DriverHome] GPS tracking confirmed active');
            setTracking(true);
            setError(null);
            Alert.alert('GPS Started', `Tracking bus ${busId}`);
          } else {
            console.error('[DriverHome] GPS failed to start (not tracking)');
            throw new Error('GPS failed to start');
          }
        } catch (gpsError: any) {
          console.error('[DriverHome] GPS error:', gpsError);
          setTracking(false);
          setError(gpsError.message);
          Alert.alert('GPS Error', gpsError.message);
        }
      }
    } catch (err: any) {
      console.error('[DriverHome] Toggle error:', err);
      setError(err.message);
      setTracking(false);
      Alert.alert('Error', err.message);
    }
  }, [isTracking, socket, busId]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.userName}>{user?.name || 'Driver'}</Text>
        </View>
      </View>

      <LiquidCard className="mt-6">
        <Pressable 
          onPress={() => {
            console.log('[GPSCard Press] Toggling GPS from state:', isTracking);
            toggleGPSTracking();
          }}
          style={styles.gpsPressable}
        >
          <View style={styles.gpsSection}>
            <View style={styles.gpsInfo}>
              <Ionicons 
                name={isTracking ? 'location' : 'location-outline'} 
                size={24} 
                color={isTracking ? '#10B981' : '#6B7280'} 
              />
              <View style={styles.gpsText}>
                <Text style={styles.gpsTitle}>Live GPS Tracking</Text>
                <Text style={styles.gpsStatus}>
                  {isTracking ? 'Tracking active' : 'Tracking inactive'}
                </Text>
                {error && <Text style={styles.gpsError}>Error: {error}</Text>}
              </View>
            </View>
            <Switch 
              testID="gps-toggle-switch"
              value={isTracking}
              pointerEvents="none"
              trackColor={{ false: '#E5E7EB', true: '#D1FAE533' }}
              thumbColor={isTracking ? '#10B981' : '#9CA3AF'}
            />
          </View>
        </Pressable>
      </LiquidCard>

      <LiquidCard className="mt-4">
        <Text style={styles.tripTitle}>Today's Trip</Text>
        <Text style={styles.routeName}>{displayRouteName}</Text>
        <View style={styles.tripTime}>
          <Text style={styles.tripTimeText}>
            {tripData?.startTime || '07:00'} - In Progress
          </Text>
        </View>
      </LiquidCard>

      <View style={styles.statsGrid}>
        <LiquidCard className="flex-1">
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{totalChildren}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </LiquidCard>

        <LiquidCard className="flex-1 ml-3">
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
            <Text style={styles.statValue}>{pickedUpCount}</Text>
            <Text style={styles.statLabel}>Picked</Text>
          </View>
        </LiquidCard>
      </View>

      <View style={styles.statsGrid}>
        <LiquidCard className="flex-1">
          <View style={styles.statCard}>
            <Ionicons name="home-outline" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{droppedOffCount}</Text>
            <Text style={styles.statLabel}>Dropped</Text>
          </View>
        </LiquidCard>

        <LiquidCard className="flex-1 ml-3">
          <View style={styles.statCard}>
            <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
            <Text style={styles.statValue}>{absentCount}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
        </LiquidCard>
      </View>

      <View style={styles.actionButtons}>
        <LargeCTAButton
          title="Mark Attendance"
          onPress={() => navigation.navigate('Attendance' as never)}
          className="mb-3"
        />
        <LargeCTAButton
          title="View Route Map"
          onPress={() => navigation.navigate('RouteMap' as never)}
          variant="secondary"
          className="mb-3"
        />
        <LargeCTAButton
          title="Send Broadcast Message"
          onPress={() => navigation.navigate('BroadcastMessage' as never)}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  tripTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  routeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  tripTime: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tripTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  statsGrid: {
    flexDirection: 'row',
    marginTop: 12,
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  actionButtons: {
    marginTop: 24,
  },
  gpsPressable: {
    padding: 0,
  },
  gpsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gpsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gpsText: {
    marginLeft: 12,
    flex: 1,
  },
  gpsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  gpsStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  gpsError: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 2,
  },
});
