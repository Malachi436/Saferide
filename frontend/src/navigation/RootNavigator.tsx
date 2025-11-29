import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import { LoginScreen, ParentSignUpScreen, AddChildScreen, PaymentScreen } from '../screens';
import { ParentTabNavigator } from './ParentTabNavigator';
import { DriverStackNavigator } from './DriverStackNavigator';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { isAuthenticated, role } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FDFDFD' },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="ParentSignUp"
              component={ParentSignUpScreen}
              options={{ headerShown: true, title: 'Sign Up' }}
            />
          </>
        ) : role === 'parent' ? (
          <>
            <Stack.Screen name="ParentApp" component={ParentTabNavigator} />
            <Stack.Screen
              name="AddChild"
              component={AddChildScreen}
              options={{ headerShown: true, title: 'Add Child', presentation: 'modal' }}
            />
            <Stack.Screen
              name="Payment"
              component={PaymentScreen}
              options={{ headerShown: true, title: 'Payment', presentation: 'modal' }}
            />
          </>
        ) : (
          <Stack.Screen name="DriverApp" component={DriverStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
