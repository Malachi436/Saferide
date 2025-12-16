import { DriversService } from './drivers.service';
export declare class DriversController {
    private readonly driversService;
    constructor(driversService: DriversService);
    create(createDriverDto: any): Promise<{
        id: string;
        license: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<any[]>;
    getTodayTrip(userId: string): Promise<any>;
    findOne(id: string): Promise<{
        id: string;
        license: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateDriverDto: any): Promise<{
        id: string;
        license: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        license: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
