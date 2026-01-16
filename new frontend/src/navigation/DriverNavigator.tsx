/**
 * Driver Navigator
 * Navigation structure for driver users
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme";

// Import screens
import DriverHomeScreen from "../screens/driver/DriverHomeScreen";
import AttendanceScreen from "../screens/driver/AttendanceScreen";
import ChildListScreen from "../screens/driver/ChildListScreen";
import RouteMapScreen from "../screens/driver/RouteMapScreen";
import BroadcastMessageScreen from "../screens/driver/BroadcastMessageScreen";
import DriverSettingsScreen from "../screens/driver/DriverSettingsScreen";
import PrivacySecurityScreen from "../screens/driver/PrivacySecurityScreen";
import HelpSupportScreen from "../screens/driver/HelpSupportScreen";

export type DriverStackParamList = {
  DriverHome: undefined;
  Attendance: undefined;
  ChildList: { filter?: "all" | "waiting" | "picked_up" | "dropped_off" } | undefined;
  RouteMap: undefined;
  BroadcastMessage: undefined;
  DriverSettings: undefined;
  PrivacySecurity: undefined;
  HelpSupport: undefined;
};

const Stack = createNativeStackNavigator<DriverStackParamList>();

export default function DriverNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.neutral.pureWhite,
        },
        headerTintColor: colors.neutral.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        options={{ title: "Today's Trip" }}
      />
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: "Attendance", headerShown: false }}
      />
      <Stack.Screen
        name="ChildList"
        component={ChildListScreen}
        options={{ title: "Attendance" }}
      />
      <Stack.Screen
        name="RouteMap"
        component={RouteMapScreen}
        options={{ title: "Route Map" }}
      />
      <Stack.Screen
        name="BroadcastMessage"
        component={BroadcastMessageScreen}
        options={{
          title: "Broadcast Message",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="DriverSettings"
        component={DriverSettingsScreen}
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name="PrivacySecurity"
        component={PrivacySecurityScreen}
        options={{ title: "Privacy & Security" }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ title: "Help & Support" }}
      />
    </Stack.Navigator>
  );
}
