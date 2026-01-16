/**
 * DriverHomeScreen - SafeRide UI
 * Driver dashboard with animated glowing orbs and GPS tracking
 * CRITICAL: Preserves GPS tracking, Socket.io logic, attendance flow
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { useAttendanceStore } from '../stores/attendanceStore';
import { LiquidCard, LargeCTAButton, GlowingOrb } from '../components';
import { gpsService } from '../services/gpsService';
import { apiClient } from '../utils/api';
import { Trip } from '../types';
import { colors } from '../theme';

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

    const SOCKET_URL = 'http://172.20.10.3:3000';
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      upgrade: true,
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
  const busId =
    todayTrip?.bus?.id ||
    todayTrip?.busId ||
    (activeTrip as any)?.id ||
    'unknown-bus';
  const displayRouteName =
    typeof todayTrip?.route === 'string'
      ? todayTrip.route
      : (todayTrip?.route as any)?.name ||
        (activeTrip as any)?.route ||
        'Osu - Greenfield Route';
  const totalChildren =
    todayTrip?.attendances?.length ||
    todayTrip?.totalChildren ||
    (activeTrip as any)?.totalChildren ||
    3;
  const pickedUpCount =
    todayTrip?.attendances?.filter((a: any) => a.status === 'PICKED_UP').length ||
    todayTrip?.pickedUp ||
    (activeTrip as any)?.pickedUp ||
    0;
  const tripStatus = todayTrip?.status || (activeTrip as any)?.status || 'In Progress';

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
        console.log(
          '[DriverHome] Starting GPS, socket:',
          socket?.id,
          'connected:',
          socket?.connected
        );
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
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[colors.primary.yellow, colors.primary.darkYellow, colors.accent.safetyOrange]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />

      {/* Floating Glowing Orbs - CRITICAL ANIMATION */}
      <GlowingOrb
        size={180}
        color="rgba(255, 255, 255, 0.65)"
        delay={0}
        duration={10000}
        startX={-40}
        startY={10}
      />
      <GlowingOrb
        size={130}
        color="rgba(255, 220, 100, 0.7)"
        delay={2000}
        duration={12000}
        startX={220}
        startY={40}
      />
      <GlowingOrb
        size={110}
        color="rgba(255, 150, 80, 0.6)"
        delay={4000}
        duration={15000}
        startX={120}
        startY={70}
      />
      <GlowingOrb
        size={90}
        color="rgba(255, 200, 200, 0.55)"
        delay={6000}
        duration={13000}
        startX={40}
        startY={100}
      />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.userName}>{user?.name || 'Driver'}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* GPS Tracking Card */}
          <Pressable
            activeOpacity={0.7}
            onPress={() => {
              console.log('[GPS Pressable] Pressed! isTracking:', isTracking);
              toggleGPSTracking();
            }}
          >
            <LiquidCard intensity="heavy" style={styles.cardSpacing}>
              <View style={styles.gpsSection}>
                <View style={styles.gpsInfo}>
                  <View
                    style={[
                      styles.gpsIcon,
                      { backgroundColor: isTracking ? colors.status.success + '20' : colors.neutral.gray + '20' },
                    ]}
                  >
                    <Ionicons
                      name={isTracking ? 'location' : 'location-outline'}
                      size={24}
                      color={isTracking ? colors.status.success : colors.neutral.gray}
                    />
                  </View>
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
                  onValueChange={toggleGPSTracking}
                  trackColor={{
                    false: colors.neutral.textSecondary + '40',
                    true: colors.status.success + '60',
                  }}
                  thumbColor={isTracking ? colors.status.success : colors.neutral.pureWhite}
                  ios_backgroundColor={colors.neutral.textSecondary + '40'}
                />
              </View>
            </LiquidCard>
          </Pressable>

          {/* Trip Info Card */}
          <LiquidCard intensity="heavy" style={styles.cardSpacing}>
            <View style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Ionicons name="calendar" size={24} color={colors.primary.yellow} />
                <Text style={styles.tripTitle}>Today's Trip</Text>
              </View>
              <Text style={styles.routeName}>{displayRouteName}</Text>
              <View style={styles.tripStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{totalChildren}</Text>
                  <Text style={styles.statLabel}>Children</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{tripStatus}</Text>
                  <Text style={styles.statLabel}>Status</Text>
                </View>
              </View>
            </View>
          </LiquidCard>

          {/* View Attendance Button */}
          <LargeCTAButton
            title="VIEW ATTENDANCE"
            onPress={() => navigation.navigate('AttendanceScreen' as never)}
            variant="primary"
            style={styles.ctaButton}
          />

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Pressable
                onPress={() => navigation.navigate('AttendanceScreen' as never)}
                style={styles.actionCard}
              >
                <LiquidCard intensity="medium">
                  <View style={styles.actionContent}>
                    <Ionicons name="people" size={32} color={colors.primary.yellow} />
                    <Text style={styles.actionText}>Attendance</Text>
                  </View>
                </LiquidCard>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('RouteMapScreen' as never)}
                style={styles.actionCard}
              >
                <LiquidCard intensity="medium">
                  <View style={styles.actionContent}>
                    <Ionicons name="map" size={32} color={colors.status.success} />
                    <Text style={styles.actionText}>Route Map</Text>
                  </View>
                </LiquidCard>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('BroadcastMessageScreen' as never)}
                style={styles.actionCard}
              >
                <LiquidCard intensity="medium">
                  <View style={styles.actionContent}>
                    <Ionicons name="megaphone" size={32} color={colors.accent.safetyOrange} />
                    <Text style={styles.actionText}>Broadcast</Text>
                  </View>
                </LiquidCard>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('Settings' as never)}
                style={styles.actionCard}
              >
                <LiquidCard intensity="medium">
                  <View style={styles.actionContent}>
                    <Ionicons name="settings" size={32} color={colors.neutral.gray} />
                    <Text style={styles.actionText}>Settings</Text>
                  </View>
                </LiquidCard>
              </Pressable>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 16,
    color: colors.neutral.warmCream,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.neutral.pureWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  cardSpacing: {
    marginBottom: 16,
  },
  gpsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 4,
  },
  gpsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gpsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gpsText: {
    flex: 1,
  },
  gpsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 2,
  },
  gpsStatus: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  gpsError: {
    fontSize: 12,
    color: colors.status.danger,
    marginTop: 2,
  },
  tripCard: {
    padding: 8,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
  },
  routeName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.neutral.textPrimary,
    marginBottom: 16,
  },
  tripStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral.textSecondary + '30',
  },
  ctaButton: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
  },
  actionContent: {
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    textAlign: 'center',
  },
});

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.userName}>{user?.name || 'Driver'}</Text>
        </View>
      </View>

      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => {
          console.log('[GPS TouchableOpacity] Pressed! isTracking:', isTracking);
          toggleGPSTracking();
        }}
      >
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
                  {isTracking ? 'Tracking active' : 'Tracking inactive'}
                </Text>
                {error && <Text style={styles.gpsError}>Error: {error}</Text>}
              </View>
            </View>
            <Switch 
              testID="gps-toggle-switch"
              value={isTracking}
              trackColor={{ false: '#E5E7EB', true: '#D1FAE533' }}
              thumbColor={isTracking ? '#10B981' : '#9CA3AF'}
            />
          </View>
        </LiquidCard>
      </TouchableOpacity>

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
