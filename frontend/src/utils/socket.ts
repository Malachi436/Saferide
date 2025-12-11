/**
 * WebSocket Service for Real-time Notifications
 * Handles Socket.IO connection and event subscriptions
 * Optimized for cross-platform (iOS/Android) reliability
 */

import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use the same base URL as the API client
const SOCKET_URL = 'http://192.168.100.13:3000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 20;
  private isReconnecting = false;

  /**
   * Connect to WebSocket server with authentication
   * Uses platform-specific optimizations for reliability
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

    console.log('[Socket] Connecting to:', SOCKET_URL, 'Platform:', Platform.OS);

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Platform-specific transport configuration
    // Android works better with websocket first, iOS with polling first
    const transports = Platform.OS === 'android' 
      ? ['websocket', 'polling'] 
      : ['polling', 'websocket'];

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports,
      upgrade: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 30000, // Increased timeout for Android
      forceNew: true,
      // Android-specific: use larger ping interval
      ...(Platform.OS === 'android' && {
        pingInterval: 25000,
        pingTimeout: 20000,
      }),
    });

    this.setupEventHandlers();
    this.reconnectAttempts = 0;
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
    console.log(`[Socket] Registered listener for: ${event}`);

    // If socket is already connected, attach the listener immediately
    if (this.socket?.connected) {
      this.socket.on(event, (data: any) => {
        console.log(`[Socket] Event received: ${event}`, data);
        callback(data);
      });
    }
    // Otherwise, it will be attached when connection is established (in setupEventHandlers)
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
   * Get the socket instance for external use (e.g., gpsService)
   */
  getSocket(): Socket | null {
    return this.socket;
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
