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
        latitude: number;
        longitude: number;
        busId: string;
        timestamp: Date;
        speed: number;
    }>;
    getCurrentLocation(busId: string): Promise<any>;
    getRecentLocations(busId: string): Promise<{
        id: string;
        createdAt: Date;
        latitude: number;
        longitude: number;
        busId: string;
        timestamp: Date;
        speed: number;
    }[]>;
}
export {};
