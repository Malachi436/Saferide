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
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
    }>;
    findActiveByChild(childId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
    }>;
    findActiveByCompany(companyId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
    }[]>;
    update(id: string, updateTripDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
    }>;
    transitionStatus(id: string, statusDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
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
