import { TripsService } from './trips.service';
import { TripAutomationService } from './trip-automation.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class TripsController {
    private readonly tripsService;
    private readonly tripAutomationService;
    private readonly prisma;
    constructor(tripsService: TripsService, tripAutomationService: TripAutomationService, prisma: PrismaService);
    create(createTripDto: any): Promise<{
        id: string;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findActiveByChild(childId: string, req: any): Promise<{
        id: string;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findActiveByCompany(companyId: string): Promise<{
        id: string;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    update(id: string, updateTripDto: any): Promise<{
        id: string;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    transitionStatus(id: string, statusDto: any): Promise<{
        id: string;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    generateTodayTrips(): Promise<{
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
