import { PrismaService } from '../../prisma/prisma.service';
import { Route } from '@prisma/client';
export declare class RoutesService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<Route | null>;
    findBySchoolId(schoolId: string): Promise<Route[]>;
    create(data: any): Promise<Route>;
    update(id: string, data: any): Promise<Route>;
    findAll(): Promise<Route[]>;
    remove(id: string): Promise<Route>;
}
