import { NotificationsService } from './notifications.service';
import { NotificationType } from '@prisma/client';
declare class CreateNotificationDto {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
}
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    createNotification(createNotificationDto: CreateNotificationDto): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isRead: boolean;
        sentAt: Date;
        readAt: Date | null;
    }>;
    getUserNotifications(userId: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isRead: boolean;
        sentAt: Date;
        readAt: Date | null;
    }[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(id: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isRead: boolean;
        sentAt: Date;
        readAt: Date | null;
    }>;
}
export {};
