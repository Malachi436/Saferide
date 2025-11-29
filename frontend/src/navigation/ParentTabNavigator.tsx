import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ParentHomeScreen, LiveTrackingScreen, NotificationsScreen, SettingsScreen } from '../screens';

const Tab = createBottomTabNavigator();

export const ParentTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={ParentHomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="LiveTracking"
        component={LiveTrackingScreen}
        options={{
          title: 'Tracking',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="location-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="notifications-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
