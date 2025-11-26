import { DriversService } from './drivers.service';
export declare class DriversController {
    private readonly driversService;
    constructor(driversService: DriversService);
    create(createDriverDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        license: string;
        userId: string;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        license: string;
        userId: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        license: string;
        userId: string;
    }>;
    update(id: string, updateDriverDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        license: string;
        userId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        license: string;
        userId: string;
    }>;
}
