import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useAuth } from '../stores/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';

export default function SettingsScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
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
      ]
    );
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
      'Email: support@rosago.com\nPhone: +250 XXX XXX XXX',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-blue-600 p-6 pb-8">
          <Text className="text-white text-3xl font-bold">Settings</Text>
          <Text className="text-blue-100 mt-1">Manage your account and preferences</Text>
        </View>

        {/* Profile Section */}
        <View className="bg-white mx-4 -mt-4 rounded-2xl shadow-lg p-6 mb-4">
          <View className="items-center mb-4">
            <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-3">
              <Text className="text-4xl">👤</Text>
            </View>
            <Text className="text-xl font-bold text-slate-900">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-slate-500 mt-1">{user?.email}</Text>
            <View className="mt-2 px-3 py-1 bg-blue-100 rounded-full">
              <Text className="text-blue-700 text-xs font-semibold uppercase">
                {user?.role}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleEditProfile}
            className="bg-blue-600 rounded-xl py-3 mt-2"
          >
            <Text className="text-white text-center font-bold">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View className="bg-white mx-4 rounded-2xl shadow-sm p-6 mb-4">
          <Text className="text-lg font-bold text-slate-900 mb-4">Preferences</Text>

          <View className="flex-row justify-between items-center py-3 border-b border-slate-100">
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Push Notifications</Text>
              <Text className="text-slate-500 text-sm">Receive trip and attendance updates</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f4f4f5'}
            />
          </View>

          <View className="flex-row justify-between items-center py-3">
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Location Services</Text>
              <Text className="text-slate-500 text-sm">Enable GPS tracking</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
              thumbColor={locationEnabled ? '#ffffff' : '#f4f4f5'}
            />
          </View>
        </View>

        {/* Account Actions */}
        <View className="bg-white mx-4 rounded-2xl shadow-sm p-6 mb-4">
          <Text className="text-lg font-bold text-slate-900 mb-4">Account</Text>

          <TouchableOpacity
            onPress={handleChangePassword}
            className="flex-row items-center py-3 border-b border-slate-100"
          >
            <Text className="text-2xl mr-3">🔒</Text>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Change Password</Text>
              <Text className="text-slate-500 text-sm">Update your password</Text>
            </View>
            <Text className="text-slate-400 text-xl">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearCache}
            className="flex-row items-center py-3 border-b border-slate-100"
          >
            <Text className="text-2xl mr-3">🗑️</Text>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Clear Cache</Text>
              <Text className="text-slate-500 text-sm">Free up storage space</Text>
            </View>
            <Text className="text-slate-400 text-xl">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContactSupport}
            className="flex-row items-center py-3"
          >
            <Text className="text-2xl mr-3">💬</Text>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Contact Support</Text>
              <Text className="text-slate-500 text-sm">Get help with your account</Text>
            </View>
            <Text className="text-slate-400 text-xl">›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="bg-white mx-4 rounded-2xl shadow-sm p-6 mb-4">
          <Text className="text-lg font-bold text-slate-900 mb-4">About</Text>

          <View className="py-2">
            <Text className="text-slate-500 text-sm">App Version</Text>
            <Text className="text-slate-900 font-semibold mt-1">
              {Application.nativeApplicationVersion || '1.0.0'}
            </Text>
          </View>

          <View className="py-2">
            <Text className="text-slate-500 text-sm">Build Number</Text>
            <Text className="text-slate-900 font-semibold mt-1">
              {Application.nativeBuildVersion || '1'}
            </Text>
          </View>
        </View>

        {/* Legal */}
        <View className="bg-white mx-4 rounded-2xl shadow-sm p-6 mb-4">
          <Text className="text-lg font-bold text-slate-900 mb-4">Legal</Text>

          <TouchableOpacity className="py-3 border-b border-slate-100">
            <Text className="text-slate-900 font-semibold">Terms of Service</Text>
          </TouchableOpacity>

          <TouchableOpacity className="py-3 border-b border-slate-100">
            <Text className="text-slate-900 font-semibold">Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity className="py-3">
            <Text className="text-slate-900 font-semibold">Licenses</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View className="mx-4 mb-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-600 rounded-xl py-4"
          >
            <Text className="text-white text-center font-bold text-lg">Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center pb-8">
          <Text className="text-slate-400 text-sm">Made with ❤️ by ROSAgo Team</Text>
          <Text className="text-slate-400 text-xs mt-1">© 2025 ROSAgo. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
