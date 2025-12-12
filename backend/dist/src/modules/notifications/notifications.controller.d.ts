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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        isRead: boolean;
        requiresAck: boolean;
        acknowledgedAt: Date | null;
        relatedEntityType: string | null;
        relatedEntityId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        sentAt: Date;
        readAt: Date | null;
    }>;
    getUserNotifications(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        isRead: boolean;
        requiresAck: boolean;
        acknowledgedAt: Date | null;
        relatedEntityType: string | null;
        relatedEntityId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        sentAt: Date;
        readAt: Date | null;
    }[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        isRead: boolean;
        requiresAck: boolean;
        acknowledgedAt: Date | null;
        relatedEntityType: string | null;
        relatedEntityId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        sentAt: Date;
        readAt: Date | null;
    }>;
    acknowledgeNotification(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        isRead: boolean;
        requiresAck: boolean;
        acknowledgedAt: Date | null;
        relatedEntityType: string | null;
        relatedEntityId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        sentAt: Date;
        readAt: Date | null;
    }>;
    getUnacknowledgedNotifications(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        isRead: boolean;
        requiresAck: boolean;
        acknowledgedAt: Date | null;
        relatedEntityType: string | null;
        relatedEntityId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        sentAt: Date;
        readAt: Date | null;
    }[]>;
}
export {};
