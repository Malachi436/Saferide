import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { LiquidCard, LargeCTAButton } from '../components';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <LiquidCard className="mb-4">
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
          </View>
        </View>
      </LiquidCard>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <LiquidCard>
          <MenuItem iconName="person-outline" title="Profile Information" />
          <MenuItem iconName="notifications-outline" title="Notification Preferences" />
          <MenuItem iconName="card-outline" title="Payment Methods" />
          <MenuItem iconName="shield-outline" title="Privacy & Security" />
        </LiquidCard>
      </View>

      <LargeCTAButton
        title="Log Out"
        onPress={handleLogout}
        variant="danger"
        className="mt-8"
      />
    </ScrollView>
  );
};

interface MenuItemProps {
  iconName: string;
  title: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ iconName, title }) => (
  <View style={styles.menuItem}>
    <Ionicons name={iconName as any} size={20} color="#6B7280" />
    <Text style={styles.menuItemText}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
  },
});
