import * as Location from 'expo-location';
import { Socket } from 'socket.io-client';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: string;
}

let locationSubscription: Location.LocationSubscription | null = null;

export const gpsService = {
  /**
   * Request location permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[GPS] Permission request failed:', error);
      return false;
    }
  },

  /**
   * Start tracking location and emit to backend via Socket.IO
   */
  async startTracking(socket: Socket, busId: string, interval: number = 5000): Promise<void> {
    try {
      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('[GPS] Location permission not granted');
        return;
      }

      console.log('[GPS] Starting location tracking...');

      // Watch for location updates
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: interval,
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const gpsData: GPSLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            speed: location.coords.speed,
            heading: location.coords.heading,
            timestamp: new Date().toISOString(),
          };

          // Emit to backend
          if (socket.connected) {
            socket.emit('gps_update', {
              busId,
              ...gpsData,
            });
            console.log('[GPS] Emitted location:', gpsData);
          }
        }
      );
    } catch (error) {
      console.error('[GPS] Failed to start tracking:', error);
    }
  },

  /**
   * Get current location once
   */
  async getCurrentLocation(): Promise<GPSLocation | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('[GPS] Location permission not granted');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        heading: location.coords.heading,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[GPS] Failed to get current location:', error);
      return null;
    }
  },

  /**
   * Stop tracking location
   */
  stopTracking(): void {
    if (locationSubscription) {
      locationSubscription.remove();
      locationSubscription = null;
      console.log('[GPS] Stopped tracking');
    }
  },

  /**
   * Check if currently tracking
   */
  isTracking(): boolean {
    return locationSubscription !== null;
  },
};
