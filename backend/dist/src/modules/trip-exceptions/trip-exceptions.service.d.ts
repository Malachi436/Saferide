import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export declare class TripExceptionsService {
    private prisma;
    private realtimeGateway?;
    constructor(prisma: PrismaService, realtimeGateway?: RealtimeGateway);
    skipTrip(childId: string, tripId: string, reason?: string): Promise<any>;
    cancelSkipTrip(childId: string, tripId: string): Promise<any>;
    getTripExceptions(tripId: string): Promise<any[]>;
    getChildExceptions(childId: string): Promise<any[]>;
    getExceptionsByDate(date: Date): Promise<any[]>;
}
