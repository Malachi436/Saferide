import { TripsService } from './trips.service';
export declare class TripsController {
    private readonly tripsService;
    constructor(tripsService: TripsService);
    create(createTripDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
        busId: string;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
        busId: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
        busId: string;
    }>;
    update(id: string, updateTripDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
        busId: string;
    }>;
    transitionStatus(id: string, statusDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
        busId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        status: import(".prisma/client").$Enums.TripStatus;
        startTime: Date | null;
        endTime: Date | null;
        busId: string;
    }>;
}
