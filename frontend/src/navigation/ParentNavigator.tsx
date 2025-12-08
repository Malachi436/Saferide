/**
 * Parent Navigator
 * Navigation structure for parent users
 */

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

// Import screens
import ParentHomeScreen from "../screens/parent/ParentHomeScreen";
import LiveTrackingScreen from "../screens/parent/LiveTrackingScreen";
import NotificationsScreen from "../screens/parent/NotificationsScreen";
import SettingsScreen from "../screens/parent/SettingsScreen";
import AddChildScreen from "../screens/parent/AddChildScreen";
import EditProfileScreen from "../screens/parent/EditProfileScreen";
import ManageChildrenScreen from "../screens/parent/ManageChildrenScreen";
import PrivacySettingsScreen from "../screens/parent/PrivacySettingsScreen";
import ChangePasswordScreen from "../screens/parent/ChangePasswordScreen";
import HelpSupportScreen from "../screens/parent/HelpSupportScreen";
import TermsPrivacyScreen from "../screens/parent/TermsPrivacyScreen";
import PaymentsScreen from "../screens/parent/PaymentsScreen";
import ReceiptHistoryScreen from "../screens/parent/ReceiptHistoryScreen";

export type ParentTabParamList = {
  Home: undefined;
  Tracking: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export type ParentStackParamList = {
  Main: undefined;
  AddChild: undefined;
  EditProfile: undefined;
  ManageChildren: undefined;
  PrivacySettings: undefined;
  ChangePassword: undefined;
  HelpSupport: undefined;
  TermsPrivacy: undefined;
  Payments: undefined;
  ReceiptHistory: undefined;
};

const Tab = createBottomTabNavigator<ParentTabParamList>();
const Stack = createNativeStackNavigator<ParentStackParamList>();

function ParentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary.blue,
        tabBarInactiveTintColor: colors.neutral.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.neutral.pureWhite,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 88,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={ParentHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Tracking"
        component={LiveTrackingScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="location" size={size} color={color} />,
          tabBarLabel: "Track",
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function ParentNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.neutral.pureWhite,
        },
        headerTintColor: colors.neutral.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Main"
        component={ParentTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddChild"
        component={AddChildScreen}
        options={{
          title: "Add Child",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: "Edit Profile",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="ManageChildren"
        component={ManageChildrenScreen}
        options={{ title: "Manage Children" }}
      />
      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{ title: "Privacy & Security" }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          title: "Change Password",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ title: "Help & Support" }}
      />
      <Stack.Screen
        name="TermsPrivacy"
        component={TermsPrivacyScreen}
        options={{ title: "Terms & Privacy" }}
      />
      <Stack.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{ title: "Payments" }}
      />
      <Stack.Screen
        name="ReceiptHistory"
        component={ReceiptHistoryScreen}
        options={{ title: "Receipt History" }}
      />
    </Stack.Navigator>
  );
}
