'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

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

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

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
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      setConnected(false);
    });

    // Listen for GPS updates
    socketRef.current.on('bus_location', (data: BusLocation) => {
      console.log('[Socket] Bus location:', data);
      setBusLocations((prev) => {
        const updated = {
          ...prev,
          [data.busId]: data,
        };
        console.log('[Socket] Updated bus locations from bus_location:', updated);
        return updated;
      });
    });

    // Listen for new location updates (broadcast to all)
    socketRef.current.on('new_location_update', (data: BusLocation) => {
      console.log('[Socket] New location update:', data);
      setBusLocations((prev) => {
        const updated = {
          ...prev,
          [data.busId]: data,
        };
        console.log('[Socket] Updated bus locations from new_location_update:', updated);
        return updated;
      });
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
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connected,
    busLocations,
    joinBusRoom,
    connect,
    disconnect,
  };
}
