import { PrismaService } from '../../prisma/prisma.service';
import { Driver } from '@prisma/client';
export declare class DriversService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<Driver | null>;
    findByUserId(userId: string): Promise<Driver | null>;
    findByLicense(license: string): Promise<Driver | null>;
    create(data: any): Promise<Driver>;
    update(id: string, data: any): Promise<Driver>;
    findAll(): Promise<Driver[]>;
    remove(id: string): Promise<Driver>;
    getTodayTrip(driverId: string): Promise<any>;
}
