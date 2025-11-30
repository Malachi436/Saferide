import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto, SignupDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
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
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    signup(signupDto: SignupDto): Promise<any>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        access_token: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        resetToken: string;
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
