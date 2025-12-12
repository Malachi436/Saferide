import { PrismaService } from '../../prisma/prisma.service';
import { Notification, NotificationType } from '@prisma/client';
export declare class NotificationsService {
    private prisma;
    private readonly outboundQueue;
    private readonly redis;
    constructor(prisma: PrismaService);
    createNotification(userId: string, title: string, message: string, type?: NotificationType): Promise<Notification>;
    markAsRead(id: string): Promise<Notification>;
    getUserNotifications(userId: string): Promise<Notification[]>;
    getUnreadCount(userId: string): Promise<number>;
    sendNotificationToUser(userId: string, title: string, message: string, type?: NotificationType): Promise<Notification>;
    create(data: {
        userId: string;
        title: string;
        message: string;
        type: NotificationType;
        requiresAck?: boolean;
        relatedEntityType?: string;
        relatedEntityId?: string;
        metadata?: any;
    }): Promise<Notification>;
    acknowledgeNotification(id: string, userId: string): Promise<Notification>;
    getUnacknowledgedNotifications(userId: string): Promise<Notification[]>;
}
