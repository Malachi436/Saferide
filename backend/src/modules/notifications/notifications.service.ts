import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Notification, NotificationType } from '@prisma/client';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

@Injectable()
export class NotificationsService {
  private readonly outboundQueue: Queue;
  private readonly redis: Redis;

  constructor(private prisma: PrismaService) {
    this.redis = new Redis(process.env.REDIS_URL);
    this.outboundQueue = new Queue('notification.outbound', {
      connection: this.redis,
    });
  }

  async createNotification(userId: string, title: string, message: string, type: NotificationType = NotificationType.INFO): Promise<Notification> {
    // Save to database
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });

    // Add to outbound queue for processing
    await this.outboundQueue.add('send-notification', {
      notificationId: notification.id,
      userId,
      title,
      message,
      type,
    });

    return notification;
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async sendNotificationToUser(userId: string, title: string, message: string, type: NotificationType = NotificationType.INFO): Promise<Notification> {
    return this.createNotification(userId, title, message, type);
  }

  // Create notification with additional metadata support
  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    requiresAck?: boolean;
    relatedEntityType?: string;
    relatedEntityId?: string;
    metadata?: any;
  }): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        requiresAck: data.requiresAck || false,
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
        metadata: data.metadata,
      },
    });

    // Add to outbound queue
    try {
      await this.outboundQueue.add('send-notification', {
        notificationId: notification.id,
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        requiresAck: data.requiresAck,
        metadata: data.metadata,
      });
    } catch (error) {
      // Queue might be disabled - continue without it
      console.warn('Failed to add notification to queue:', error);
    }

    return notification;
  }

  // Acknowledge notification (for driver notifications)
  async acknowledgeNotification(id: string, userId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found or unauthorized');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        acknowledgedAt: new Date(),
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  // Get notifications requiring acknowledgment
  async getUnacknowledgedNotifications(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: {
        userId,
        requiresAck: true,
        acknowledgedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}