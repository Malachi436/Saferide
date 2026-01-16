/**
 * Root Navigator
 * Main navigation structure for ROSAgo app
 * Routes authenticated users to Parent or Driver flows only
 */

import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../state/authStore";
import { colors } from "../theme";

// Import screens
import LoginScreen from "../screens/auth/LoginScreen";
import ParentSignUpScreen from "../screens/auth/ParentSignUpScreen";
import ParentNavigator from "./ParentNavigator";
import DriverNavigator from "./DriverNavigator";

export type RootStackParamList = {
  Login: undefined;
  ParentSignUp: undefined;
  ParentApp: undefined;
  DriverApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  // Show loading screen while hydrating from AsyncStorage
  if (!hasHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.yellow} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ParentSignUp" component={ParentSignUpScreen} />
        </>
      ) : (
        <>
          {role === "parent" && <Stack.Screen name="ParentApp" component={ParentNavigator} />}
          {role === "driver" && <Stack.Screen name="DriverApp" component={DriverNavigator} />}
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.neutral.warmCream,
  },
});
