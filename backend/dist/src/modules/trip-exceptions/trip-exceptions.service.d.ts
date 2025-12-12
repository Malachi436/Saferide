import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';
export declare class TripExceptionsService {
    private prisma;
    private realtimeGateway?;
    private notificationsService?;
    constructor(prisma: PrismaService, realtimeGateway?: RealtimeGateway, notificationsService?: NotificationsService);
    skipTrip(childId: string, tripId: string, reason?: string): Promise<any>;
    cancelSkipTrip(childId: string, tripId: string): Promise<any>;
    getTripExceptions(tripId: string): Promise<any[]>;
    getChildExceptions(childId: string): Promise<any[]>;
    getExceptionsByDate(date: Date): Promise<any[]>;
    unskipTrip(childId: string, tripId: string, parentId: string, reason?: string): Promise<any>;
}
