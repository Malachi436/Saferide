import { PrismaService } from '../../prisma/prisma.service';
import { Trip, TripStatus } from '@prisma/client';
export declare class TripsService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<Trip | null>;
    create(data: any): Promise<Trip>;
    update(id: string, data: any): Promise<Trip>;
    findAll(): Promise<Trip[]>;
    findActiveByChildId(childId: string): Promise<Trip | null>;
    remove(id: string): Promise<Trip>;
    transitionTripStatus(tripId: string, newStatus: TripStatus, userId: string): Promise<Trip>;
    private isValidTransition;
}
