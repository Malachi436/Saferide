import { PrismaService } from '../../prisma/prisma.service';
import { User, Role } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: {
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        phone?: string;
        role: Role;
        companyId?: string | null;
        schoolId?: string | null;
    }): Promise<{
        id: string;
        email: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        companyId: string | null;
        passwordHash: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        refreshToken: string | null;
        schoolId: string | null;
    }>;
    update(id: string, data: Partial<User>): Promise<User>;
    findAll(): Promise<any[]>;
    remove(id: string): Promise<User>;
}
