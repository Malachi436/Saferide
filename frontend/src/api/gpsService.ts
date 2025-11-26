/**
 * GPS Service
 * Handles operations related to GPS tracking and location data
 */

import apiClient from './client';

export interface HeartbeatRequest {
  busId: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
}

export interface LocationResponse {
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
}

class GpsService {
  /**
   * Send GPS heartbeat data
   */
  async sendHeartbeat(heartbeatData: HeartbeatRequest): Promise<any> {
    try {
      const response = await apiClient.post('/gps/heartbeat', heartbeatData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to send GPS heartbeat');
    }
  }

  /**
   * Get current location of a bus
   */
  async getCurrentLocation(busId: string): Promise<LocationResponse> {
    try {
      const response = await apiClient.get<LocationResponse>(`/gps/location/${busId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch current location');
    }
  }

  /**
   * Get recent locations of a bus
   */
  async getRecentLocations(busId: string): Promise<LocationResponse[]> {
    try {
      const response = await apiClient.get<LocationResponse[]>(`/gps/locations/${busId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch recent locations');
    }
  }
}

export default new GpsService();