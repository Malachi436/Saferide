import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<{
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
    update(id: string, updateUserDto: any): Promise<{
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
    remove(id: string): Promise<{
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
}
