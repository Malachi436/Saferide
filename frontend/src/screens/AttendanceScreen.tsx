/**
 * AttendanceScreen - SafeRide UI
 * Mark child attendance with glassmorphism cards
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAttendanceStore } from '../stores/attendanceStore';
import { ChildTile, LiquidCard } from '../components';
import { colors } from '../theme';

export const AttendanceScreen = () => {
  const { children, toggleChildStatus } = useAttendanceStore();

  const waitingCount = children.filter((c) => c.status === 'waiting').length;
  const pickedUpCount = children.filter((c) => c.status === 'picked_up').length;
  const droppedOffCount = children.filter((c) => c.status === 'dropped_off').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mark Attendance</Text>
        <Text style={styles.subtitle}>Tap on a child to update their status</Text>

        {/* Stats Card */}
        <LiquidCard intensity="heavy" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{children.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent.safetyOrange }]}>
                {waitingCount}
              </Text>
              <Text style={styles.statLabel}>Waiting</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.status.success }]}>
                {pickedUpCount}
              </Text>
              <Text style={styles.statLabel}>Picked Up</Text>
            </View>
          </View>
        </LiquidCard>

        {/* Children List */}
        <View style={styles.list}>
          {children.map((child) => (
            <ChildTile key={child.id} child={child} onPress={() => toggleChildStatus(child.id)} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.warmCream,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral.textSecondary,
    marginBottom: 20,
  },
  statsCard: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral.textSecondary + '30',
  },
  list: {
    gap: 12,
  },
});
