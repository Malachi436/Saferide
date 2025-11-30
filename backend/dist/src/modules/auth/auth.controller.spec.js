"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
describe('AuthController', () => {
    let controller;
    let authService;
    let usersService;
    let jwtService;
    const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '+233123456789',
        passwordHash: '$2b$10$hashedpassword',
        role: 'PARENT',
        companyId: null,
        schoolId: null,
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [auth_controller_1.AuthController],
            providers: [
                {
                    provide: auth_service_1.AuthService,
                    useValue: {
                        validateUser: jest.fn(),
                        login: jest.fn(),
                        signup: jest.fn(),
                        requestPasswordReset: jest.fn(),
                        resetPassword: jest.fn(),
                        refreshAccessToken: jest.fn(),
                    },
                },
                {
                    provide: users_service_1.UsersService,
                    useValue: {
                        findByEmail: jest.fn(),
                        create: jest.fn(),
                    },
                },
                {
                    provide: jwt_1.JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('token'),
                    },
                },
            ],
        }).compile();
        controller = module.get(auth_controller_1.AuthController);
        authService = module.get(auth_service_1.AuthService);
        usersService = module.get(users_service_1.UsersService);
        jwtService = module.get(jwt_1.JwtService);
    });
    describe('POST /auth/login', () => {
        it('should return tokens on successful login', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'Test@1234',
            };
            const mockResponse = {
                access_token: 'access_token',
                refresh_token: 'refresh_token',
                role: client_1.Role.PARENT,
                userId: '123',
                companyId: null,
                user: {
                    id: '123',
                    email: 'test@example.com',
                    firstName: 'Test',
                    lastName: 'User',
                    phone: '+233123456789',
                    role: client_1.Role.PARENT,
                },
            };
            jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
            jest.spyOn(authService, 'login').mockResolvedValue(mockResponse);
            const result = await controller.login(loginDto);
            expect(result).toEqual(mockResponse);
            expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'Test@1234');
        });
        it('should throw UnauthorizedException on invalid credentials', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };
            jest.spyOn(authService, 'validateUser').mockResolvedValue(null);
            try {
                await controller.login(loginDto);
                fail('Should have thrown UnauthorizedException');
            }
            catch (error) {
                expect(error).toBeInstanceOf(common_1.UnauthorizedException);
            }
        });
    });
    describe('POST /auth/signup', () => {
        it('should create new parent account and return tokens', async () => {
            const signupDto = {
                email: 'newuser@example.com',
                password: 'Test@1234',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+233987654321',
            };
            const mockResponse = {
                access_token: 'access_token',
                refresh_token: 'refresh_token',
                role: client_1.Role.PARENT,
                userId: '456',
                companyId: null,
                user: {
                    id: '456',
                    email: 'newuser@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+233987654321',
                    role: client_1.Role.PARENT,
                },
            };
            jest.spyOn(authService, 'signup').mockResolvedValue(mockResponse);
            const result = await controller.signup(signupDto);
            expect(result).toEqual(mockResponse);
            expect(authService.signup).toHaveBeenCalledWith('newuser@example.com', 'Test@1234', 'John', 'Doe', '+233987654321');
        });
        it('should throw ConflictException if email already exists', async () => {
            const signupDto = {
                email: 'existing@example.com',
                password: 'Test@1234',
                firstName: 'Jane',
                lastName: 'Doe',
            };
            jest.spyOn(authService, 'signup').mockRejectedValue(new common_1.ConflictException('User with this email already exists'));
            try {
                await controller.signup(signupDto);
                fail('Should have thrown ConflictException');
            }
            catch (error) {
                expect(error).toBeInstanceOf(common_1.ConflictException);
            }
        });
    });
    describe('POST /auth/forgot-password', () => {
        it('should return reset token', async () => {
            const forgotPasswordDto = { email: 'test@example.com' };
            const mockResponse = {
                resetToken: 'reset_token',
                message: 'Password reset instructions sent to your email',
            };
            jest.spyOn(authService, 'requestPasswordReset').mockResolvedValue(mockResponse);
            const result = await controller.forgotPassword(forgotPasswordDto);
            expect(result).toEqual(mockResponse);
            expect(authService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
        });
    });
    describe('POST /auth/reset-password', () => {
        it('should reset password with valid token', async () => {
            const resetPasswordDto = {
                resetToken: 'valid_reset_token',
                newPassword: 'NewPass@1234',
            };
            const mockResponse = { message: 'Password reset successfully' };
            jest.spyOn(authService, 'resetPassword').mockResolvedValue(mockResponse);
            const result = await controller.resetPassword(resetPasswordDto);
            expect(result).toEqual(mockResponse);
            expect(authService.resetPassword).toHaveBeenCalledWith('valid_reset_token', 'NewPass@1234');
        });
    });
    describe('POST /auth/refresh', () => {
        it('should return new access token', async () => {
            const refreshTokenDto = { refreshToken: 'valid_refresh_token' };
            const mockResponse = { access_token: 'new_access_token' };
            jest.spyOn(authService, 'refreshAccessToken').mockResolvedValue(mockResponse);
            const result = await controller.refresh(refreshTokenDto);
            expect(result).toEqual(mockResponse);
            expect(authService.refreshAccessToken).toHaveBeenCalledWith('valid_refresh_token');
        });
    });
});
//# sourceMappingURL=auth.controller.spec.js.map