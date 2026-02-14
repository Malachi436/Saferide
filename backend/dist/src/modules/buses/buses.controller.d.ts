import { BusesService } from './buses.service';
export declare class BusesController {
    private readonly busesService;
    constructor(busesService: BusesService);
    create(createBusDto: any): Promise<{
        id: string;
        schoolId: string | null;
        createdAt: Date;
        updatedAt: Date;
        plateNumber: string;
        capacity: number;
        driverId: string | null;
    }>;
    findAll(): Promise<any[]>;
    findBySchool(schoolId: string): Promise<any[]>;
    findOne(id: string): Promise<{
        id: string;
        schoolId: string | null;
        createdAt: Date;
        updatedAt: Date;
        plateNumber: string;
        capacity: number;
        driverId: string | null;
    }>;
    update(id: string, updateBusDto: any): Promise<{
        id: string;
        schoolId: string | null;
        createdAt: Date;
        updatedAt: Date;
        plateNumber: string;
        capacity: number;
        driverId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        schoolId: string | null;
        createdAt: Date;
        updatedAt: Date;
        plateNumber: string;
        capacity: number;
        driverId: string | null;
    }>;
}
