import { TripsService } from './trips.service';
import { TripAutomationService } from './trip-automation.service';
export declare class TripsController {
    private readonly tripsService;
    private readonly tripAutomationService;
    constructor(tripsService: TripsService, tripAutomationService: TripAutomationService);
    create(createTripDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        busId: string;
        startTime: Date | null;
        endTime: Date | null;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        busId: string;
        startTime: Date | null;
        endTime: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        busId: string;
        startTime: Date | null;
        endTime: Date | null;
    }>;
    findActiveByChild(childId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        busId: string;
        startTime: Date | null;
        endTime: Date | null;
    }>;
    findActiveByCompany(companyId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        busId: string;
        startTime: Date | null;
        endTime: Date | null;
    }[]>;
    update(id: string, updateTripDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        busId: string;
        startTime: Date | null;
        endTime: Date | null;
    }>;
    transitionStatus(id: string, statusDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        busId: string;
        startTime: Date | null;
        endTime: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        busId: string;
        startTime: Date | null;
        endTime: Date | null;
    }>;
    generateTodayTrips(): Promise<{
        message: string;
    }>;
}
