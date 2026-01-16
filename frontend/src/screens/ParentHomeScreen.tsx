/**
 * ParentHomeScreen - SafeRide UI
 * Main dashboard with animated glowing orbs, driver info, and children status
 * CRITICAL: Features yellow-orange gradient + floating animated orbs
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { useAttendanceStore } from '../stores/attendanceStore';
import { Driver } from '../types/models';
import {
  LiquidCard,
  ChildTile,
  LargeCTAButton,
  GlowingOrb,
  DriverInfoBanner,
  ETAChip,
} from '../components';
import { colors } from '../theme';

export const ParentHomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { children, loadMockData } = useAttendanceStore();

  useEffect(() => {
    loadMockData();
  }, []);

  const userChildren = children.filter((c) => c.parentId === user?.id || children.length > 0);

  // Mock data for driver and bus
  const mockDriver: Driver = {
    id: '1',
    name: 'Uncle Kofi',
    email: 'kofi@saferide.com',
    phone: '+233241234567',
    role: 'driver',
    licenseNumber: 'DL-12345',
    avatar: '',
  };

  const mockBusPlate = 'GE-1234-21';
  const estimatedArrival = 12;

  return (
    <View style={styles.container}>
      {/* Background gradient - Pure School Bus Yellow to Orange */}
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
            <Text style={styles.userName}>{user?.name || 'Parent'}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate('Notifications' as never)}
              style={styles.notificationButton}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.primary.black} />
              {/* Badge placeholder */}
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Pickup Status Card */}
          <View style={styles.cardSpacing}>
            <LiquidCard intensity="heavy">
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Ionicons name="bus" size={24} color={colors.accent.safetyOrange} />
                  <Text style={styles.statusTitle}>Today's Trip</Text>
                </View>
                <View style={styles.statusContent}>
                  <Text style={styles.statusText}>Osu - Greenfield Route</Text>
                  <View style={styles.statusRow}>
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>{userChildren.length}</Text>
                      <Text style={styles.statLabel}>Children</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>In Progress</Text>
                      <Text style={styles.statLabel}>Status</Text>
                    </View>
                  </View>
                </View>
              </View>
            </LiquidCard>
          </View>

          {/* Large CTA Button */}
          <LargeCTAButton
            title="VIEW ATTENDANCE"
            onPress={() => navigation.navigate('LiveTracking' as never)}
            variant="primary"
            style={styles.ctaButton}
          />

          {/* Driver Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Driver</Text>
            <DriverInfoBanner driver={mockDriver} busPlateNumber={mockBusPlate} />
          </View>

          {/* Children List */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Children</Text>
              <Pressable onPress={() => navigation.navigate('AddChild' as never)}>
                <Ionicons name="add-circle" size={28} color={colors.primary.yellow} />
              </Pressable>
            </View>
            {userChildren.length > 0 ? (
              userChildren.map((child) => (
                <View key={child.id} style={styles.childTileSpacing}>
                  <ChildTile child={child} />
                </View>
              ))
            ) : (
              <LiquidCard>
                <Text style={styles.emptyText}>No children added yet</Text>
                <LargeCTAButton
                  title="Add First Child"
                  onPress={() => navigation.navigate('AddChild' as never)}
                  style={{ marginTop: 16 }}
                />
              </LiquidCard>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Pressable
                onPress={() => navigation.navigate('LiveTracking' as never)}
                style={styles.actionCard}
              >
                <LiquidCard intensity="medium">
                  <View style={styles.actionContent}>
                    <Ionicons name="location" size={32} color={colors.primary.yellow} />
                    <Text style={styles.actionText}>Route Map</Text>
                  </View>
                </LiquidCard>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('Payment' as never)}
                style={styles.actionCard}
              >
                <LiquidCard intensity="medium">
                  <View style={styles.actionContent}>
                    <Ionicons name="card" size={32} color={colors.status.success} />
                    <Text style={styles.actionText}>Payments</Text>
                  </View>
                </LiquidCard>
              </Pressable>
            </View>

            <View style={styles.actionsGrid}>
              <Pressable style={styles.actionCard}>
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
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
  statusCard: {
    padding: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
  },
  statusContent: {
    gap: 12,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.neutral.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  childTileSpacing: {
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.neutral.textSecondary,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionCard: {
    flex: 1,
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
