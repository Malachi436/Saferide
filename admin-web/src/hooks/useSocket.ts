'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

interface BusLocation {
  busId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: string;
}

interface UseSocketOptions {
  token?: string;
  companyId?: string;
  busIds?: string[];
}

export function useSocket(options: UseSocketOptions) {
  const { token, companyId, busIds = [] } = options;
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [busLocations, setBusLocations] = useState<{ [busId: string]: BusLocation }>({});

  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected');
      setConnected(true);

      // Join company room
      if (companyId) {
        socket.emit('join_company_room', { companyId });
      }

      // Join bus rooms
      busIds.forEach((busId) => {
        socket.emit('join_bus_room', { busId });
      });
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setConnected(false);
    });

    // Listen for location updates
    socket.on('location_update', (data: BusLocation) => {
      console.log('[Socket] Location update:', data);
      setBusLocations((prev) => ({
        ...prev,
        [data.busId]: data,
      }));
    });

    socket.on('new_location_update', (data: BusLocation) => {
      console.log('[Socket] New location update:', data);
      setBusLocations((prev) => ({
        ...prev,
        [data.busId]: data,
      }));
    });

    socket.on('bus_location', (data: BusLocation) => {
      console.log('[Socket] Bus location:', data);
      setBusLocations((prev) => ({
        ...prev,
        [data.busId]: data,
      }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, companyId, busIds.join(',')]);

  // Join additional bus rooms dynamically
  const joinBusRoom = useCallback((busId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_bus_room', { busId });
    }
  }, []);

  const leaveBusRoom = useCallback((busId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_bus_room', { busId });
    }
  }, []);

  return {
    connected,
    busLocations,
    joinBusRoom,
    leaveBusRoom,
  };
}
