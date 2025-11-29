import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DriverHomeScreen, AttendanceScreen, BroadcastMessageScreen, RouteMapScreen } from '../screens';

const Stack = createNativeStackNavigator();

export const DriverStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FDFDFD',
        },
        headerTintColor: '#111827',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        options={{ title: 'Driver Dashboard' }}
      />
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: 'Mark Attendance' }}
      />
      <Stack.Screen
        name="BroadcastMessage"
        component={BroadcastMessageScreen}
        options={{ title: 'Broadcast Message' }}
      />
      <Stack.Screen
        name="RouteMap"
        component={RouteMapScreen}
        options={{ title: 'Route Map' }}
      />
    </Stack.Navigator>
  );
};
