import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNotificationStore } from '../stores/notificationStore';
import { LiquidCard } from '../components';
import { formatRelativeTime } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { NotificationType } from '../types';

export const NotificationsScreen = () => {
  const { notifications, unreadCount, markAsRead, loadMockNotifications } = useNotificationStore();

  useEffect(() => {
    loadMockNotifications();
  }, []);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'payment':
        return 'cash-outline';
      case 'alert':
        return 'alert-circle-outline';
      case 'delay':
        return 'time-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case 'payment':
        return '#10B981';
      case 'alert':
        return '#EF4444';
      case 'delay':
        return '#F59E0B';
      default:
        return '#3B82F6';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {notifications.length === 0 ? (
        <LiquidCard>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </LiquidCard>
      ) : (
        notifications.map((notification) => {
          const iconName = getIcon(notification.type);
          const iconColor = getIconColor(notification.type);

          return (
            <Pressable
              key={notification.id}
              onPress={() => !notification.read && markAsRead(notification.id)}
            >
              <LiquidCard className="mb-3">
                <View style={styles.notificationContainer}>
                  <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                    <Ionicons name={iconName as any} size={20} color={iconColor} />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>
                      {formatRelativeTime(notification.timestamp)}
                    </Text>
                  </View>
                  {!notification.read && <View style={styles.unreadDot} />}
                </View>
              </LiquidCard>
            </Pressable>
          );
        })
      )}
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
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
    padding: 24,
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
});
