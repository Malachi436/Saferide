/**
 * Notifications Service
 * Handles operations related to user notifications
 */

import apiClient from './client';
import { Notification, NotificationType } from '../types/models';

export interface CreateNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
}

class NotificationsService {
  /**
   * Create a new notification
   */
  async createNotification(notificationData: CreateNotificationRequest): Promise<Notification> {
    try {
      const response = await apiClient.post<Notification>('/notifications', notificationData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const response = await apiClient.get<Notification[]>(`/notifications/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Get unread notifications count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>(`/notifications/unread-count/${userId}`);
      return response.data.count;
    } catch (error) {
      throw new Error('Failed to fetch unread count');
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const response = await apiClient.patch<Notification>(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to mark notification as read');
    }
  }
}

export default new NotificationsService();