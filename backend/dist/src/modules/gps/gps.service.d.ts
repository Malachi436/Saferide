import { PrismaService } from '../../prisma/prisma.service';
import { BusLocation } from '@prisma/client';
export declare class GpsService {
    private prisma;
    private readonly redis;
    private readonly HEARTBEAT_THRESHOLD;
    constructor(prisma: PrismaService);
    processHeartbeat(busId: string, latitude: number, longitude: number, speed: number, timestamp: Date): Promise<BusLocation>;
    getCurrentLocation(busId: string): Promise<any>;
    getRecentLocations(busId: string, limit?: number): Promise<BusLocation[]>;
    getLocationHistory(busId: string, startTime?: Date, endTime?: Date, limit?: number): Promise<BusLocation[]>;
}
