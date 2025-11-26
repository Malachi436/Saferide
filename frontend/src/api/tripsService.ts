/**
 * Trips Service
 * Handles operations related to trip management
 */

import apiClient from './client';
import { Trip, TripStatus } from '../types/models';

export interface CreateTripRequest {
  routeId: string;
  busId: string;
  driverId: string;
  date: string;
  status: TripStatus;
  startTime?: string;
  childIds: string[];
}

export interface UpdateTripRequest {
  routeId?: string;
  busId?: string;
  driverId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  childIds?: string[];
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface TransitionTripStatusRequest {
  status: TripStatus;
  userId: string;
}

class TripsService {
  /**
   * Get all trips
   */
  async getAllTrips(): Promise<Trip[]> {
    try {
      const response = await apiClient.get<Trip[]>('/trips');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch trips');
    }
  }

  /**
   * Get a specific trip by ID
   */
  async getTripById(tripId: string): Promise<Trip> {
    try {
      const response = await apiClient.get<Trip>(`/trips/${tripId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch trip');
    }
  }

  /**
   * Create a new trip
   */
  async createTrip(tripData: CreateTripRequest): Promise<Trip> {
    try {
      const response = await apiClient.post<Trip>('/trips', tripData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create trip');
    }
  }

  /**
   * Update a trip
   */
  async updateTrip(tripId: string, tripData: UpdateTripRequest): Promise<Trip> {
    try {
      const response = await apiClient.patch<Trip>(`/trips/${tripId}`, tripData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update trip');
    }
  }

  /**
   * Transition trip status
   */
  async transitionTripStatus(tripId: string, statusData: TransitionTripStatusRequest): Promise<Trip> {
    try {
      const response = await apiClient.patch<Trip>(`/trips/${tripId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update trip status');
    }
  }

  /**
   * Delete a trip
   */
  async deleteTrip(tripId: string): Promise<void> {
    try {
      await apiClient.delete(`/trips/${tripId}`);
    } catch (error) {
      throw new Error('Failed to delete trip');
    }
  }
}

export default new TripsService();