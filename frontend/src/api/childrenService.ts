/**
 * Children Service
 * Handles operations related to children management
 */

import apiClient from './client';
import { Child } from '../types/models';

export interface CreateChildRequest {
  name: string;
  parentId: string;
  schoolId: string;
  pickupType: 'home' | 'roadside';
  pickupLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface UpdateChildRequest {
  name?: string;
  schoolId?: string;
  pickupType?: 'home' | 'roadside';
  pickupLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  dropoffLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status?: 'waiting' | 'picked_up' | 'on_way' | 'arrived' | 'dropped_off';
  busId?: string;
  routeId?: string;
}

class ChildrenService {
  /**
   * Get all children for a parent
   */
  async getChildrenByParent(parentId: string): Promise<Child[]> {
    try {
      const response = await apiClient.get<Child[]>(`/children/parent/${parentId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch children');
    }
  }

  /**
   * Get a specific child by ID
   */
  async getChildById(childId: string): Promise<Child> {
    try {
      const response = await apiClient.get<Child>(`/children/${childId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch child');
    }
  }

  /**
   * Create a new child
   */
  async createChild(childData: CreateChildRequest): Promise<Child> {
    try {
      const response = await apiClient.post<Child>('/children', childData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create child');
    }
  }

  /**
   * Update a child
   */
  async updateChild(childId: string, childData: UpdateChildRequest): Promise<Child> {
    try {
      const response = await apiClient.patch<Child>(`/children/${childId}`, childData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update child');
    }
  }

  /**
   * Delete a child
   */
  async deleteChild(childId: string): Promise<void> {
    try {
      await apiClient.delete(`/children/${childId}`);
    } catch (error) {
      throw new Error('Failed to delete child');
    }
  }
}

export default new ChildrenService();