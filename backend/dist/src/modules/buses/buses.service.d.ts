import { PrismaService } from '../../prisma/prisma.service';
import { Bus } from '@prisma/client';
export declare class BusesService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<Bus | null>;
    findByPlateNumber(plateNumber: string): Promise<Bus | null>;
    findByDriverId(driverId: string): Promise<Bus[]>;
    create(data: any): Promise<Bus>;
    update(id: string, data: any): Promise<Bus>;
    findAll(): Promise<Bus[]>;
    remove(id: string): Promise<Bus>;
}
