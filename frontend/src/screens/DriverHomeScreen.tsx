import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { useAttendanceStore } from '../stores/attendanceStore';
import { useGPSStore } from '../stores/gpsStore';
import { LiquidCard, LargeCTAButton } from '../components';
import { Ionicons } from '@expo/vector-icons';
import { gpsService } from '../services/gpsService';
import { apiClient } from '../utils/api';
import { io } from 'socket.io-client';

interface Trip {
  id: string;
  bus: { id: string; plateNumber: string };
  route: { name: string };
  startTime: string;
  attendances: Array<{ child: any }>;
}

export const DriverHomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { activeTrip: mockTrip, children, loadMockData } = useAttendanceStore();
  const { isTracking, setTracking, error, setError } = useGPSStore();
  const [socket, setSocket] = useState<any>(null);
  const [todayTrip, setTodayTrip] = useState<Trip | null>(null);

  useEffect(() => {
    loadMockData();
    fetchTodayTrip();
    // Initialize socket connection
    const newSocket = io('http://192.168.100.8:3000', {
      transports: ['websocket'],
      reconnection: true,
    });
    setSocket(newSocket);
    return () => {
      if (gpsService.isTracking()) {
        gpsService.stopTracking();
      }
      newSocket.disconnect();
    };
  }, []);

  const fetchTodayTrip = async () => {
    try {
      if (!user?.id) return;
      const response = await apiClient.get<Trip>(
        `/drivers/${user.id}/today-trip`
      );
      if (response) {
        console.log('[DriverHome] Today trip fetched:', response);
        setTodayTrip(response);
      }
    } catch (err: any) {
      console.log('[DriverHome] No trip found for today:', err.message);
    }
  };

  const activeTrip = todayTrip || mockTrip;
  const busId = todayTrip?.bus.id || (activeTrip as any)?.id || 'unknown-bus';

  const displayRouteName = todayTrip?.route?.name || (activeTrip as any)?.route || 'Route A - Morning';
  const totalChildren = todayTrip?.attendances?.length || (activeTrip as any)?.totalChildren || 4;
  const pickedUpCount = todayTrip?.attendances?.filter((a: any) => a.status === 'PICKED_UP').length || (activeTrip as any)?.pickedUp || 2;
  const droppedOffCount = todayTrip?.attendances?.filter((a: any) => a.status === 'DROPPED_OFF').length || (activeTrip as any)?.droppedOff || 0;
  const absentCount = todayTrip?.attendances?.filter((a: any) => a.status === 'ABSENT').length || (activeTrip as any)?.absent || 0;

  const toggleGPSTracking = async () => {
    try {
      if (isTracking) {
        gpsService.stopTracking();
        setTracking(false);
        setError(null);
        Alert.alert('Success', 'Location tracking stopped');
      } else {
        if (!socket) {
          Alert.alert('Error', 'Connection not ready');
          return;
        }
        
        // Join bus room before starting GPS tracking
        console.log('[DriverHome] Joining bus room:', busId);
        socket.emit('join_bus_room', { busId });
        
        await gpsService.startTracking(socket, busId, 5000);
        setTracking(true);
        setError(null);
        Alert.alert('Success', `Location tracking started for bus ${busId}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to toggle GPS';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.userName}>{user?.name || 'Driver'}</Text>
        </View>
      </View>

      <LiquidCard className="mt-6">
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
                {isTracking ? '🟢 Tracking active' : '⚪ Tracking inactive'}
              </Text>
              {error && <Text style={styles.gpsError}>Error: {error}</Text>}
            </View>
          </View>
          <Switch 
            value={isTracking} 
            onValueChange={toggleGPSTracking}
            trackColor={{ false: '#E5E7EB', true: '#D1FAE533' }}
            thumbColor={isTracking ? '#10B981' : '#9CA3AF'}
          />
        </View>
      </LiquidCard>

      <LiquidCard className="mt-4">
        <Text style={styles.tripTitle}>Today's Trip</Text>
        <Text style={styles.routeName}>{displayRouteName}</Text>
        <View style={styles.tripTime}>
          <Text style={styles.tripTimeText}>
            {activeTrip?.startTime || '07:00'} - In Progress
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
  gpsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gpsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
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
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  gpsError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 2,
  },
});
