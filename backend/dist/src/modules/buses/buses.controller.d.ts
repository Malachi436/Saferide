import { BusesService } from './buses.service';
export declare class BusesController {
    private readonly busesService;
    constructor(busesService: BusesService);
    create(createBusDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string | null;
        driverId: string | null;
        plateNumber: string;
        capacity: number;
    }>;
    findAll(): Promise<any[]>;
    findByCompany(companyId: string): Promise<any[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string | null;
        driverId: string | null;
        plateNumber: string;
        capacity: number;
    }>;
    update(id: string, updateBusDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string | null;
        driverId: string | null;
        plateNumber: string;
        capacity: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string | null;
        driverId: string | null;
        plateNumber: string;
        capacity: number;
    }>;
}
