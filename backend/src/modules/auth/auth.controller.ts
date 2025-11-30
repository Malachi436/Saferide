import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto, SignupDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('[Auth Controller] Login attempt:', loginDto.email);
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    console.log('[Auth Controller] User validation result:', user ? 'success' : 'failed');
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(
      signupDto.email,
      signupDto.password,
      signupDto.firstName,
      signupDto.lastName,
      signupDto.phone
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(forgotPasswordDto.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.resetToken, resetPasswordDto.newPassword);
  }
}