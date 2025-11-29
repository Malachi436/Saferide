import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { useAttendanceStore } from '../stores/attendanceStore';
import { LiquidCard, LargeCTAButton } from '../components';
import { Ionicons } from '@expo/vector-icons';

export const DriverHomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { activeTrip, children, loadMockData } = useAttendanceStore();

  useEffect(() => {
    loadMockData();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.userName}>{user?.name || 'Driver'}</Text>
        </View>
      </View>

      <LiquidCard className="mt-6">
        <Text style={styles.tripTitle}>Today's Trip</Text>
        <Text style={styles.routeName}>{activeTrip?.route || 'Route A - Morning'}</Text>
        <View style={styles.tripTime}>
          <Text style={styles.tripTimeText}>
            {activeTrip?.startTime || '07:00'} - {activeTrip?.endTime || 'In Progress'}
          </Text>
        </View>
      </LiquidCard>

      <View style={styles.statsGrid}>
        <LiquidCard className="flex-1">
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{activeTrip?.totalChildren || 4}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </LiquidCard>

        <LiquidCard className="flex-1 ml-3">
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
            <Text style={styles.statValue}>{activeTrip?.pickedUp || 2}</Text>
            <Text style={styles.statLabel}>Picked</Text>
          </View>
        </LiquidCard>
      </View>

      <View style={styles.statsGrid}>
        <LiquidCard className="flex-1">
          <View style={styles.statCard}>
            <Ionicons name="home-outline" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{activeTrip?.droppedOff || 0}</Text>
            <Text style={styles.statLabel}>Dropped</Text>
          </View>
        </LiquidCard>

        <LiquidCard className="flex-1 ml-3">
          <View style={styles.statCard}>
            <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
            <Text style={styles.statValue}>{activeTrip?.absent || 0}</Text>
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
});
