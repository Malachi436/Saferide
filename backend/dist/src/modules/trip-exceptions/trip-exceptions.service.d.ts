import { PrismaService } from '../../prisma/prisma.service';
export declare class TripExceptionsService {
    private prisma;
    constructor(prisma: PrismaService);
    skipTrip(childId: string, tripId: string, reason?: string): Promise<any>;
    cancelSkipTrip(childId: string, tripId: string): Promise<any>;
    getTripExceptions(tripId: string): Promise<any[]>;
    getChildExceptions(childId: string): Promise<any[]>;
    getExceptionsByDate(date: Date): Promise<any[]>;
}
