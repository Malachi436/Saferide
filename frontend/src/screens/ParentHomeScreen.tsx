import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { useAttendanceStore } from '../stores/attendanceStore';
import { LiquidCard, ChildTile, LargeCTAButton } from '../components';
import { Ionicons } from '@expo/vector-icons';

export const ParentHomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { children, loadMockData } = useAttendanceStore();

  useEffect(() => {
    // Load mock data on mount
    loadMockData();
  }, []);

  const userChildren = children.filter(c => c.parentId === user?.id || children.length > 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.userName}>{user?.name || 'Parent'}</Text>
        </View>
      </View>

      <LiquidCard className="mt-6">
        <View style={styles.quickStats}>
          <View style={styles.stat}>
            <Ionicons name="bus" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{userChildren.length || 2}</Text>
            <Text style={styles.statLabel}>Children</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Ionicons name="location-outline" size={24} color="#10B981" />
            <Text style={styles.statValue}>
              {userChildren.filter(c => c.status === 'picked_up').length || 1}
            </Text>
            <Text style={styles.statLabel}>Picked Up</Text>
          </View>
        </View>
      </LiquidCard>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Children</Text>
          <Pressable onPress={() => navigation.navigate('AddChild' as never)}>
            <Ionicons name="add-outline" size={24} color="#3B82F6" />
          </Pressable>
        </View>

        {userChildren.length > 0 ? (
          userChildren.map((child) => (
            <ChildTile key={child.id} child={child} />
          ))
        ) : (
          <LiquidCard>
            <Text style={styles.emptyText}>No children added yet</Text>
            <LargeCTAButton
              title="Add First Child"
              onPress={() => navigation.navigate('AddChild' as never)}
              className="mt-4"
            />
          </LiquidCard>
        )}
      </View>

      <View style={styles.actionButtons}>
        <LargeCTAButton
          title="Track Live Location"
          onPress={() => navigation.navigate('LiveTracking' as never)}
          className="mb-3"
        />
        <LargeCTAButton
          title="Make Payment"
          onPress={() => navigation.navigate('Payment' as never)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#E5E7EB',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
  },
  actionButtons: {
    marginTop: 24,
  },
});
