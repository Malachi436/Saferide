import { BusesService } from './buses.service';
export declare class BusesController {
    private readonly busesService;
    constructor(busesService: BusesService);
    create(createBusDto: any): Promise<{
        id: string;
        plateNumber: string;
        capacity: number;
        driverId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<any[]>;
    findByCompany(companyId: string): Promise<any[]>;
    findOne(id: string): Promise<{
        id: string;
        plateNumber: string;
        capacity: number;
        driverId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateBusDto: any): Promise<{
        id: string;
        plateNumber: string;
        capacity: number;
        driverId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        plateNumber: string;
        capacity: number;
        driverId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
