import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { SocketProvider } from './src/context/SocketContext';
import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <SocketProvider>
          <RootNavigator />
        </SocketProvider>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
