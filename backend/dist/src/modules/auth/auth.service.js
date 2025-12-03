"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const users_service_1 = require("../users/users.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.saltRounds = 10;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (user && await this.comparePasswords(password, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
    async signup(email, password, firstName, lastName, phone) {
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const passwordHash = await this.hashPassword(password);
        const newUser = await this.usersService.create({
            email,
            passwordHash,
            firstName,
            lastName,
            phone,
            role: client_1.Role.PARENT,
        });
        return this.login(newUser);
    }
    async login(user) {
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            companyId: user.companyId,
            schoolId: user.schoolId
        };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: await this.generateRefreshToken(user),
            role: user.role,
            companyId: user.companyId,
            userId: user.id,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                companyId: user.companyId,
            }
        };
    }
    async hashPassword(password) {
        return bcrypt.hash(password, this.saltRounds);
    }
    async comparePasswords(password, hash) {
        return bcrypt.compare(password, hash);
    }
    async generateRefreshToken(user) {
        const payload = {
            email: user.email,
            sub: user.id
        };
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        });
        const hashedRefreshToken = await this.hashPassword(refreshToken);
        await this.usersService.update(user.id, { refreshToken: hashedRefreshToken });
        return refreshToken;
    }
    async refreshAccessToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
            const user = await this.usersService.findOne(payload.sub);
            if (!user || !user.refreshToken) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const isValid = await this.comparePasswords(refreshToken, user.refreshToken);
            if (!isValid) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const newPayload = {
                email: user.email,
                sub: user.id,
                role: user.role,
                companyId: user.companyId,
                schoolId: user.schoolId
            };
            return {
                access_token: this.jwtService.sign(newPayload),
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async requestPasswordReset(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.BadRequestException('If email exists, password reset link will be sent');
        }
        const resetToken = this.jwtService.sign({ sub: user.id, email: user.email, type: 'password-reset' }, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '1h',
        });
        return {
            resetToken,
            message: 'Password reset instructions sent to your email',
        };
    }
    async resetPassword(resetToken, newPassword) {
        try {
            const payload = this.jwtService.verify(resetToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
            if (payload.type !== 'password-reset') {
                throw new common_1.BadRequestException('Invalid token type');
            }
            const user = await this.usersService.findOne(payload.sub);
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            const passwordHash = await this.hashPassword(newPassword);
            await this.usersService.update(user.id, { passwordHash });
            return { message: 'Password reset successfully' };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map