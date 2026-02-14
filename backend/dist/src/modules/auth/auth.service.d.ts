import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { User } from '@prisma/client';
export declare class AuthService {
    private usersService;
    private jwtService;
    private emailService;
    private readonly saltRounds;
    constructor(usersService: UsersService, jwtService: JwtService, emailService: EmailService);
    validateUser(email: string, password: string): Promise<any>;
    signup(email: string, password: string, firstName: string, lastName: string, phone?: string): Promise<any>;
    login(user: User): Promise<{
        access_token: string;
        refresh_token: string;
        role: import(".prisma/client").$Enums.Role;
        schoolId: string;
        userId: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            role: import(".prisma/client").$Enums.Role;
            schoolId: string;
        };
    }>;
    hashPassword(password: string): Promise<string>;
    comparePasswords(password: string, hash: string): Promise<boolean>;
    private generateRefreshToken;
    refreshAccessToken(refreshToken: string): Promise<{
        access_token: string;
    }>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    resetPassword(resetToken: string, newPassword: string): Promise<{
        message: string;
    }>;
}
