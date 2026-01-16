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
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        companyId: string | null;
        schoolId: string | null;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        refreshToken: string | null;
    }>;
    update(id: string, data: Partial<User>): Promise<User>;
    findAll(): Promise<any[]>;
    remove(id: string): Promise<User>;
    clearRefreshToken(userId: string): Promise<void>;
}
