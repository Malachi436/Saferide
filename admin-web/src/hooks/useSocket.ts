'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://172.20.10.3:3000';

export interface BusLocation {
  busId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp?: string;
}

export function useSocket(companyId: string | null) {
  const [connected, setConnected] = useState(false);
  const [busLocations, setBusLocations] = useState<{ [busId: string]: BusLocation }>({});
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (!companyId) {
      console.log('[Socket] No companyId, skipping connection');
      return;
    }

    if (socketRef.current?.connected) {
      console.log('[Socket] Already connected');
      return;
    }

    console.log('[Socket] Connecting to:', SOCKET_URL);

    // Get fresh token on every connection attempt
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    console.log('[Socket] Using token:', token ? `${token.substring(0, 20)}...` : 'null');

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    socketRef.current.on('connect', () => {
      console.log('[Socket] Connected:', socketRef.current?.id);
      setConnected(true);

      // Join company room
      socketRef.current?.emit('join_company_room', { companyId });
      console.log('[Socket] Joined company room:', companyId);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setConnected(false);
      
      // If disconnected due to auth error, try reconnecting with fresh token
      if (reason === 'io server disconnect' || reason === 'transport error') {
        console.log('[Socket] Auth issue detected, will reconnect with fresh token');
        setTimeout(() => {
          disconnect();
          connect();
        }, 2000);
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message || error);
      setConnected(false);
      
      // If auth error, disconnect and retry with fresh token
      if (error.message?.includes('jwt') || error.message?.includes('expired')) {
        console.log('[Socket] JWT expired, forcing reconnection with fresh token');
        disconnect();
      }
    });

    socketRef.current.on('error', (error) => {
      console.error('[Socket] Socket error:', error);
      setConnected(false);
    });

    // Listen for GPS updates
    socketRef.current.on('bus_location', (data: BusLocation) => {
      console.log('[Socket] *** BUS_LOCATION EVENT RECEIVED ***');
      console.log('[Socket] Bus location data:', JSON.stringify(data));
      setBusLocations((prev) => {
        const updated = {
          ...prev,
          [data.busId]: data,
        };
        console.log('[Socket] Updated bus locations:', Object.keys(updated).length, 'buses');
        return updated;
      });
    });

    // Listen for new location updates (broadcast to all)
    socketRef.current.on('new_location_update', (data: BusLocation) => {
      console.log('[Socket] *** NEW_LOCATION_UPDATE EVENT RECEIVED ***');
      console.log('[Socket] Location update data:', JSON.stringify(data));
      setBusLocations((prev) => {
        const updated = {
          ...prev,
          [data.busId]: data,
        };
        console.log('[Socket] Updated bus locations:', Object.keys(updated).length, 'buses');
        return updated;
      });
    });

    // Listen for ALL events for debugging
    socketRef.current.onAny((eventName, ...args) => {
      console.log('[Socket] Event received:', eventName, args);
    });
  }, [companyId]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[Socket] Disconnecting...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  const joinBusRoom = useCallback((busId: string) => {
    if (socketRef.current?.connected) {
      console.log('[Socket] Joining bus room:', busId);
      socketRef.current.emit('join_bus_room', { busId });
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      connect();
    }
    
    // Listen for token refresh events
    const handleTokenRefresh = () => {
      console.log('[Socket] Token refreshed, reconnecting...');
      disconnect();
      setTimeout(() => connect(), 500);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('token-refreshed', handleTokenRefresh);
    }
    
    return () => {
      disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('token-refreshed', handleTokenRefresh);
      }
    };
  }, [companyId, connect, disconnect]);

  return {
    connected,
    busLocations,
    joinBusRoom,
    connect,
    disconnect,
  };
}
