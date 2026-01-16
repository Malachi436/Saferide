import { PrismaService } from '../../prisma/prisma.service';
export declare class TripAutomationService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateDailyTrips(): Promise<void>;
    private createTripFromSchedule;
    private assignChildrenToTrip;
    private getDayOfWeek;
    generateTripsManually(): Promise<{
        success: boolean;
        message: string;
        generatedAt: string;
        generationType: string;
        existingTripsCount: number;
        tripsCreated?: undefined;
    } | {
        success: boolean;
        message: string;
        generatedAt: string;
        generationType: string;
        tripsCreated: number;
        existingTripsCount?: undefined;
    }>;
}
