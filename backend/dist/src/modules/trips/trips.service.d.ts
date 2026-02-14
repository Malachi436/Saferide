import { PrismaService } from '../../prisma/prisma.service';
import { Trip, TripStatus } from '@prisma/client';
export declare class TripsService {
    private prisma;
    constructor(prisma: PrismaService);
    static readonly DELAY_REASONS: string[];
    static readonly EMERGENCY_TYPES: string[];
    findOne(id: string): Promise<Trip | null>;
    create(data: any): Promise<Trip>;
    update(id: string, data: any): Promise<Trip>;
    findAll(): Promise<Trip[]>;
    findActiveByChildId(childId: string): Promise<Trip | null>;
    findActiveBySchoolId(schoolId: string): Promise<Trip[]>;
    remove(id: string): Promise<Trip>;
    transitionTripStatus(tripId: string, newStatus: TripStatus, userId: string, metadata?: {
        delayMinutes?: number;
        delayReason?: string;
        emergencyType?: string;
        emergencyNote?: string;
    }): Promise<Trip>;
    private sendStatusNotification;
    assignBackupDriver(tripId: string, backupDriverId: string): Promise<Trip>;
    private isValidTransition;
}
