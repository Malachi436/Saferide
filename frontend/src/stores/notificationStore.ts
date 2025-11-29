import { create } from 'zustand';
import { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  loadMockNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (notificationId: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  loadMockNotifications: () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'delay',
        title: 'Bus Delay',
        message: 'Your child\'s bus is running 10 minutes late due to traffic.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
      {
        id: '2',
        type: 'payment',
        title: 'Payment Due',
        message: 'Your monthly payment of $50 is due in 3 days.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false,
      },
      {
        id: '3',
        type: 'alert',
        title: 'Child Picked Up',
        message: 'Emma has been picked up successfully at 7:30 AM.',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        read: true,
      },
      {
        id: '4',
        type: 'info',
        title: 'Route Change',
        message: 'Route A will have a temporary detour on Main Street next week.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
      },
    ];

    set({
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter(n => !n.read).length,
    });
  },
}));
