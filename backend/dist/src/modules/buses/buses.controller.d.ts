import { BusesService } from './buses.service';
export declare class BusesController {
    private readonly busesService;
    constructor(busesService: BusesService);
    create(createBusDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plateNumber: string;
        capacity: number;
        driverId: string;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plateNumber: string;
        capacity: number;
        driverId: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plateNumber: string;
        capacity: number;
        driverId: string;
    }>;
    update(id: string, updateBusDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plateNumber: string;
        capacity: number;
        driverId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plateNumber: string;
        capacity: number;
        driverId: string;
    }>;
}
