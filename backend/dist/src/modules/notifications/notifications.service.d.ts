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
}
