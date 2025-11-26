import { PrismaService } from '../../prisma/prisma.service';
import { Child } from '@prisma/client';
export declare class ChildrenService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<Child | null>;
    findByParentId(parentId: string): Promise<Child[]>;
    findBySchoolId(schoolId: string): Promise<Child[]>;
    create(data: any): Promise<Child>;
    update(id: string, data: any): Promise<Child>;
    findAll(): Promise<Child[]>;
    remove(id: string): Promise<Child>;
}
