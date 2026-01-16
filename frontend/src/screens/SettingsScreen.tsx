/**
 * SettingsScreen - SafeRide UI
 * Parent account and app settings with glassmorphism design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/authStore';
import { LiquidCard } from '../components';
import { colors } from '../theme';

export default function SettingsScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pickupAlerts, setPickupAlerts] = useState(true);
  const [dropoffAlerts, setDropoffAlerts] = useState(true);
  const [delayAlerts, setDelayAlerts] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleClearCache = async () => {
    Alert.alert('Clear Cache', 'This will clear all cached data. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            Alert.alert('Success', 'Cache cleared successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to clear cache');
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert('Coming Soon', 'Profile editing will be available in a future update');
  };

  const handleChangePassword = () => {
    Alert.alert('Coming Soon', 'Password change will be available in a future update');
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Email: support@saferide.com\nPhone: +233 XXX XXX XXX',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.headerTitle}>Settings</Text>

        {/* Profile Section */}
        <LiquidCard intensity="heavy" style={styles.cardSpacing}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('') || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>
              <Text style={styles.profilePhone}>{user?.phone || ''}</Text>
            </View>
            <Pressable onPress={handleEditProfile} style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color={colors.primary.black} />
            </Pressable>
          </View>
        </LiquidCard>

        {/* Children Management */}
        <Text style={styles.sectionTitle}>Children</Text>
        <LiquidCard intensity="medium" style={styles.cardSpacing}>
          <Pressable
            onPress={() => navigation.navigate('AddChild')}
            style={styles.settingItem}
          >
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: colors.accent.skyBlue + '20' }]}
              >
                <Ionicons name="people" size={20} color={colors.accent.skyBlue} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Manage Children</Text>
                <Text style={styles.settingSubtitle}>Add or edit your children information</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
          </Pressable>
        </LiquidCard>

        {/* Notification Settings */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <LiquidCard intensity="medium" style={styles.cardSpacing}>
          <View style={styles.settingsGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[styles.settingIcon, { backgroundColor: colors.status.info + '20' }]}
                >
                  <Ionicons name="notifications" size={20} color={colors.status.info} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Push Notifications</Text>
                  <Text style={styles.settingSubtitle}>Receive updates about your children</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: colors.neutral.textSecondary + '40',
                  true: colors.status.success + '60',
                }}
                thumbColor={notificationsEnabled ? colors.status.success : colors.neutral.pureWhite}
                ios_backgroundColor={colors.neutral.textSecondary + '40'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: colors.accent.safetyOrange + '20' },
                  ]}
                >
                  <Ionicons name="log-in" size={20} color={colors.accent.safetyOrange} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Pickup Alerts</Text>
                  <Text style={styles.settingSubtitle}>Notify when child is picked up</Text>
                </View>
              </View>
              <Switch
                value={pickupAlerts}
                onValueChange={setPickupAlerts}
                trackColor={{
                  false: colors.neutral.textSecondary + '40',
                  true: colors.status.success + '60',
                }}
                thumbColor={pickupAlerts ? colors.status.success : colors.neutral.pureWhite}
                ios_backgroundColor={colors.neutral.textSecondary + '40'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[styles.settingIcon, { backgroundColor: colors.status.success + '20' }]}
                >
                  <Ionicons name="log-out" size={20} color={colors.status.success} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Drop-off Alerts</Text>
                  <Text style={styles.settingSubtitle}>Notify when child is dropped off</Text>
                </View>
              </View>
              <Switch
                value={dropoffAlerts}
                onValueChange={setDropoffAlerts}
                trackColor={{
                  false: colors.neutral.textSecondary + '40',
                  true: colors.status.success + '60',
                }}
                thumbColor={dropoffAlerts ? colors.status.success : colors.neutral.pureWhite}
                ios_backgroundColor={colors.neutral.textSecondary + '40'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[styles.settingIcon, { backgroundColor: colors.status.warning + '20' }]}
                >
                  <Ionicons name="time" size={20} color={colors.status.warning} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Delay Alerts</Text>
                  <Text style={styles.settingSubtitle}>Notify about trip delays</Text>
                </View>
              </View>
              <Switch
                value={delayAlerts}
                onValueChange={setDelayAlerts}
                trackColor={{
                  false: colors.neutral.textSecondary + '40',
                  true: colors.status.success + '60',
                }}
                thumbColor={delayAlerts ? colors.status.success : colors.neutral.pureWhite}
                ios_backgroundColor={colors.neutral.textSecondary + '40'}
              />
            </View>
          </View>
        </LiquidCard>

        {/* Privacy & Support */}
        <Text style={styles.sectionTitle}>Privacy & Support</Text>
        <LiquidCard intensity="medium" style={styles.cardSpacing}>
          <Pressable onPress={handleChangePassword} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: colors.primary.yellow + '40' }]}
              >
                <Ionicons name="lock-closed" size={20} color={colors.primary.black} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Change Password</Text>
                <Text style={styles.settingSubtitle}>Update your password</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable onPress={handleContactSupport} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: colors.accent.skyBlue + '20' }]}
              >
                <Ionicons name="help-circle" size={20} color={colors.accent.skyBlue} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Help & Support</Text>
                <Text style={styles.settingSubtitle}>Get help with your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIcon, { backgroundColor: colors.neutral.gray + '20' }]}
              >
                <Ionicons name="shield-checkmark" size={20} color={colors.neutral.gray} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Privacy & Security</Text>
                <Text style={styles.settingSubtitle}>Manage your data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
          </Pressable>
        </LiquidCard>

        {/* App Info */}
        <Text style={styles.sectionTitle}>About</Text>
        <LiquidCard intensity="medium" style={styles.cardSpacing}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build Number</Text>
            <Text style={styles.infoValue}>1</Text>
          </View>
        </LiquidCard>

        {/* Logout */}
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out" size={20} color={colors.neutral.pureWhite} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.warmCream,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 24,
  },
  cardSpacing: {
    marginBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: colors.primary.black,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary.black,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  settingsGroup: {
    padding: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.textSecondary + '20',
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.danger,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.pureWhite,
  },
});
