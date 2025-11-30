export declare class LoginDto {
    email: string;
    password: string;
}
export declare class SignupDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    resetToken: string;
    newPassword: string;
}
