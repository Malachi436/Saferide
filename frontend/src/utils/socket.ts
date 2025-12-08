/**
 * WebSocket Service for Real-time Notifications
 * Handles Socket.IO connection and event subscriptions
 */

import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'http://192.168.100.3:3000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Connect to WebSocket server with authentication
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected');
      return;
    }

    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      console.log('[Socket] No auth token, skipping connection');
      return;
    }

    console.log('[Socket] Connecting to:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupEventHandlers();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('[Socket] Disconnecting');
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  /**
   * Subscribe to a trip's tracking room
   */
  subscribeToTrip(tripId: string): void {
    if (this.socket) {
      console.log('[Socket] Subscribing to trip:', tripId);
      this.socket.emit('subscribe_trip_tracking', { tripId });
    }
  }

  /**
   * Unsubscribe from a trip's tracking room
   */
  unsubscribeFromTrip(tripId: string): void {
    if (this.socket) {
      console.log('[Socket] Unsubscribing from trip:', tripId);
      this.socket.emit('unsubscribe_trip_tracking', { tripId });
    }
  }

  /**
   * Listen for specific event
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, (data: any) => {
        console.log(`[Socket] Event received: ${event}`, data);
        callback(data);
      });
    }
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: Function): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }

    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback as any);
      } else {
        this.socket.off(event);
      }
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Setup default event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected successfully');
      // Re-register all event listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach((callback) => {
          this.socket!.on(event, callback as any);
        });
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('[Socket] Socket error:', error);
    });
  }
}

// Singleton instance
export const socketService = new SocketService();
