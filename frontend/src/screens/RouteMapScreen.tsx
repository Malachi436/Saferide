/**
 * RouteMapScreen - SafeRide UI
 * Map view with route overview and stop markers
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapContainer, LiquidCard } from '../components';
import { useAttendanceStore } from '../stores/attendanceStore';
import { colors } from '../theme';

export const RouteMapScreen = () => {
  const { children, activeTrip } = useAttendanceStore();

  const markers = children
    .filter(
      (child) =>
        (child.pickupLatitude && child.pickupLongitude) ||
        (child.homeLatitude && child.homeLongitude)
    )
    .map((child) => {
      const lat = child.pickupLatitude || child.homeLatitude || 0;
      const lng = child.pickupLongitude || child.homeLongitude || 0;
      const name = `${child.firstName} ${child.lastName}`;
      const schoolName =
        typeof child.school === 'object' ? child.school.name : child.school || 'School';

      return {
        id: child.id,
        coordinate: {
          latitude: lat,
          longitude: lng,
        },
        title: name,
        description: `${schoolName} - ${child.status || 'waiting'}`,
      };
    });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <MapContainer height={500} markers={markers} showsUserLocation />

      <View style={styles.info}>
        <LiquidCard intensity="heavy">
          <View style={styles.cardContent}>
            <Text style={styles.title}>Route Overview</Text>
            <Text style={styles.route}>
              {typeof activeTrip?.route === 'object'
                ? activeTrip.route.name
                : activeTrip?.route || 'Osu - Greenfield Route'}
            </Text>

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <View
                  style={[styles.statIcon, { backgroundColor: colors.primary.yellow + '20' }]}
                >
                  <Text style={styles.statValue}>{markers.length}</Text>
                </View>
                <Text style={styles.statLabel}>Stops</Text>
              </View>
              <View style={styles.statItem}>
                <View
                  style={[styles.statIcon, { backgroundColor: colors.accent.safetyOrange + '20' }]}
                >
                  <Text style={styles.statValue}>
                    {children.filter((c) => c.status === 'waiting').length}
                  </Text>
                </View>
                <Text style={styles.statLabel}>Waiting</Text>
              </View>
              <View style={styles.statItem}>
                <View
                  style={[styles.statIcon, { backgroundColor: colors.status.success + '20' }]}
                >
                  <Text style={styles.statValue}>
                    {children.filter((c) => c.status === 'picked_up').length}
                  </Text>
                </View>
                <Text style={styles.statLabel}>On Board</Text>
              </View>
            </View>
          </View>
        </LiquidCard>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.warmCream,
  },
  info: {
    padding: 20,
  },
  cardContent: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  route: {
    fontSize: 16,
    color: colors.neutral.textSecondary,
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.neutral.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.textSecondary,
    marginTop: 4,
  },
});
