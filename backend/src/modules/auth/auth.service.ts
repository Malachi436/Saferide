import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log('[AuthService] Validating user:', email);
    const user = await this.usersService.findByEmail(email);
    console.log('[AuthService] User found:', user ? 'yes' : 'no');
    if (user) {
      console.log('[AuthService] User role:', user.role);
      console.log('[AuthService] Comparing passwords...');
      const passwordMatch = await this.comparePasswords(password, user.passwordHash);
      console.log('[AuthService] Password match:', passwordMatch);
      if (passwordMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async signup(email: string, password: string, firstName: string, lastName: string, phone?: string): Promise<any> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create new user
    const newUser = await this.usersService.create({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      role: Role.PARENT,
    });

    // Return login response with tokens
    return this.login(newUser);
  }

  async login(user: User) {
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

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const payload = { 
      email: user.email, 
      sub: user.id 
    };
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
    
    // Hash the refresh token before storing
    const hashedRefreshToken = await this.hashPassword(refreshToken);
    await this.usersService.update(user.id, { refreshToken: hashedRefreshToken });
    
    return refreshToken;
  }

  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      
      const user = await this.usersService.findOne(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      // Verify the refresh token matches the stored hash
      const isValid = await this.comparePasswords(refreshToken, user.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
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
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async requestPasswordReset(email: string): Promise<{ resetToken: string; message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists (security best practice)
      throw new BadRequestException('If email exists, password reset link will be sent');
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'password-reset' },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '1h',
      }
    );

    return {
      resetToken,
      message: 'Password reset instructions sent to your email',
    };
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(resetToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (payload.type !== 'password-reset') {
        throw new BadRequestException('Invalid token type');
      }

      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const passwordHash = await this.hashPassword(newPassword);
      await this.usersService.update(user.id, { passwordHash });

      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid or expired reset token');
    }
  }
}