/**
 * Socket Context
 * Provides persistent WebSocket connection across the app
 * Maintains connection for parents to receive GPS updates even when not on tracking screen
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { socketService } from '../utils/socket';
import { useAuthStore } from '../stores/authStore';

interface BusLocation {
  busId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp?: string;
}

interface SocketContextValue {
  isConnected: boolean;
  busLocations: Record<string, BusLocation>;
  subscribeToTrip: (tripId: string) => void;
  subscribeToBus: (busId: string) => void;
  unsubscribeFromTrip: (tripId: string) => void;
  unsubscribeFromBus: (busId: string) => void;
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role, user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [busLocations, setBusLocations] = useState<Record<string, BusLocation>>({});
  const appState = useRef(AppState.currentState);
  const subscribedBuses = useRef<Set<string>>(new Set());
  const subscribedTrips = useRef<Set<string>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle bus location updates
  const handleBusLocation = useCallback((data: BusLocation) => {
    console.log('[SocketContext] Bus location received:', data.busId);
    setBusLocations(prev => ({
      ...prev,
      [data.busId]: data
    }));
  }, []);

  // Connect to socket when authenticated
  const connectSocket = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('[SocketContext] Not authenticated, skipping connection');
      return;
    }

    // Only auto-connect for parent users
    if (role !== 'parent') {
      console.log('[SocketContext] Not a parent user, skipping auto-connection');
      return;
    }

    try {
      console.log('[SocketContext] Connecting socket...');
      await socketService.connect();
      setIsConnected(socketService.isConnected());

      // Register global listeners
      socketService.on('bus_location', handleBusLocation);
      socketService.on('new_location_update', handleBusLocation);

      // Re-subscribe to all tracked buses and trips
      subscribedBuses.current.forEach(busId => {
        const socket = socketService.getSocket();
        if (socket) {
          console.log('[SocketContext] Re-joining bus room:', busId);
          socket.emit('join_bus_room', { busId });
        }
      });

      subscribedTrips.current.forEach(tripId => {
        socketService.subscribeToTrip(tripId);
      });

      console.log('[SocketContext] Socket connected successfully');
    } catch (error) {
      console.error('[SocketContext] Failed to connect:', error);
      setIsConnected(false);
      
      // Retry connection after 5 seconds on failure
      reconnectTimeoutRef.current = setTimeout(() => {
        connectSocket();
      }, 5000);
    }
  }, [isAuthenticated, role, handleBusLocation]);

  // Reconnect manually
  const reconnect = useCallback(() => {
    socketService.disconnect();
    setTimeout(connectSocket, 500);
  }, [connectSocket]);

  // Subscribe to a bus room
  const subscribeToBus = useCallback((busId: string) => {
    if (!busId) return;
    
    subscribedBuses.current.add(busId);
    
    const socket = socketService.getSocket();
    if (socket?.connected) {
      console.log('[SocketContext] Joining bus room:', busId);
      socket.emit('join_bus_room', { busId });
    }
  }, []);

  // Unsubscribe from a bus room
  const unsubscribeFromBus = useCallback((busId: string) => {
    subscribedBuses.current.delete(busId);
    
    const socket = socketService.getSocket();
    if (socket?.connected) {
      console.log('[SocketContext] Leaving bus room:', busId);
      socket.emit('leave_bus_room', { busId });
    }
  }, []);

  // Subscribe to trip tracking
  const subscribeToTrip = useCallback((tripId: string) => {
    if (!tripId) return;
    
    subscribedTrips.current.add(tripId);
    
    if (socketService.isConnected()) {
      socketService.subscribeToTrip(tripId);
    }
  }, []);

  // Unsubscribe from trip tracking
  const unsubscribeFromTrip = useCallback((tripId: string) => {
    subscribedTrips.current.delete(tripId);
    
    if (socketService.isConnected()) {
      socketService.unsubscribeFromTrip(tripId);
    }
  }, []);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App coming to foreground - ensure socket is connected
        console.log('[SocketContext] App came to foreground, checking connection');
        if (isAuthenticated && role === 'parent' && !socketService.isConnected()) {
          connectSocket();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, role, connectSocket]);

  // Connect when auth state changes
  useEffect(() => {
    if (isAuthenticated && role === 'parent') {
      connectSocket();
    } else {
      socketService.disconnect();
      setIsConnected(false);
      setBusLocations({});
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, role, connectSocket]);

  // Update connection status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(socketService.isConnected());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const value: SocketContextValue = {
    isConnected,
    busLocations,
    subscribeToTrip,
    subscribeToBus,
    unsubscribeFromTrip,
    unsubscribeFromBus,
    reconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
