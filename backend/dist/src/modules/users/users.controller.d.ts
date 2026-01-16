import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<{
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
    update(id: string, updateUserDto: any): Promise<{
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
    remove(id: string): Promise<{
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
}
