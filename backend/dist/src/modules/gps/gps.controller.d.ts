import { GpsService } from './gps.service';
declare class HeartbeatDto {
    busId: string;
    latitude: number;
    longitude: number;
    speed: number;
    timestamp: Date;
}
export declare class GpsController {
    private readonly gpsService;
    constructor(gpsService: GpsService);
    processHeartbeat(heartbeatDto: HeartbeatDto): Promise<{
        id: string;
        createdAt: Date;
        busId: string;
        latitude: number;
        longitude: number;
        speed: number;
        timestamp: Date;
    }>;
    getCurrentLocation(busId: string): Promise<any>;
    getRecentLocations(busId: string, startTime?: string, endTime?: string, limit?: string): Promise<{
        id: string;
        createdAt: Date;
        busId: string;
        latitude: number;
        longitude: number;
        speed: number;
        timestamp: Date;
    }[]>;
}
export {};
