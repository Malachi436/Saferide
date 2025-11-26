import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
declare class LoginDto {
    email: string;
    password: string;
}
declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        role: import(".prisma/client").$Enums.Role;
        companyId: string;
        userId: string;
    }>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        access_token: string;
    }>;
}
export {};
