import { Controller, Get, Post, Body, Param, UseGuards, Delete, Put, Query, UploadedFile, UseInterceptors, Req, Patch, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateFareDto } from './dto/fare-management.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @Roles('PLATFORM_ADMIN')
  async getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('stats/school/:schoolId')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getSchoolStats(@Param('schoolId') schoolId: string, @Req() req: any) {
    return this.adminService.getSchoolStats(schoolId, req.user);
  }

  @Post('company')
  @Roles('PLATFORM_ADMIN')
  async createCompany(@Body() createCompanyDto: any) {
    return this.adminService.createCompany(createCompanyDto);
  }

  @Post('school')
  @Roles('PLATFORM_ADMIN')
  async createSchool(@Body() createSchoolDto: any) {
    return this.adminService.createSchool(createSchoolDto);
  }

  @Get('companies')
  @Roles('PLATFORM_ADMIN')
  async getAllCompanies() {
    // Companies are no longer supported
    throw new BadRequestException('Companies are no longer supported');
  }

  @Get('schools')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getAllSchools() {
    return this.adminService.getAllSchools();
  }

  @Get('school/:schoolId/schools')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getCompanySchools(@Param('schoolId') schoolId: string) {
    return this.adminService.getCompanySchools(schoolId);
  }

  @Get('school/:schoolId/routes')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getSchoolRoutes(@Param('schoolId') schoolId: string) {
    return this.adminService.getSchoolRoutes(schoolId);
  }

  @Get('school/:schoolId/children')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getSchoolChildren(@Param('schoolId') schoolId: string) {
    return this.adminService.getSchoolChildren(schoolId);
  }

  @Get('school/:schoolId/children/payments')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getChildrenPayments(@Param('schoolId') schoolId: string) {
    return this.adminService.getChildrenPaymentStatus(schoolId);
  }

  @Get('school/:schoolId/drivers')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getSchoolDrivers(@Param('schoolId') schoolId: string) {
    return this.adminService.getSchoolDrivers(schoolId);
  }

  @Post('driver/:driverId/photo')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadDriverPhoto(
    @Param('driverId') driverId: string,
    @UploadedFile() file: any,
  ) {
    return this.adminService.saveDriverPhoto(driverId, file);
  }

  @Get('companies/:companyId')
  @Roles('PLATFORM_ADMIN')
  async getCompanyById(@Param('companyId') companyId: string) {
    throw new BadRequestException('Companies are no longer supported');
  }

  @Delete('company/:companyId')
  @Roles('PLATFORM_ADMIN')
  async deleteCompany(@Param('companyId') companyId: string) {
    throw new BadRequestException('Companies are no longer supported');
  }

  @Put('school/:schoolId')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async updateSchool(@Param('schoolId') schoolId: string, @Body() updateSchoolDto: any) {
    return this.adminService.updateSchool(schoolId, updateSchoolDto);
  }

  @Delete('school/:schoolId')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async deleteSchool(@Param('schoolId') schoolId: string) {
    return this.adminService.deleteSchool(schoolId);
  }

  @Get('school/:schoolId/analytics')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getSchoolAnalytics(@Param('schoolId') schoolId: string, @Query('range') range?: string) {
    return this.adminService.getSchoolAnalytics(schoolId, range);
  }

  @Get('school/:schoolId/trips')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getSchoolTrips(@Param('schoolId') schoolId: string) {
    return this.adminService.getSchoolTrips(schoolId);
  }

  @Get('school/:schoolId/trips/active')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getSchoolActiveTrips(@Param('schoolId') schoolId: string) {
    return this.adminService.getSchoolActiveTrips(schoolId);
  }

  @Get('school/:schoolId/reports/attendance')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getAttendanceReport(@Param('schoolId') schoolId: string, @Query('range') range?: string) {
    return this.adminService.getAttendanceReport(schoolId, range);
  }

  @Get('school/:schoolId/reports/payments')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getPaymentReport(@Param('schoolId') schoolId: string, @Query('range') range?: string) {
    return this.adminService.getPaymentReport(schoolId, range);
  }

  @Get('school/:schoolId/reports/driver-performance')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getDriverPerformanceReport(@Param('schoolId') schoolId: string, @Query('range') range?: string) {
    return this.adminService.getDriverPerformanceReport(schoolId, range);
  }

  // Fare Management
  @Get('school/:schoolId/fare')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getSchoolFare(@Param('schoolId') schoolId: string) {
    return this.adminService.getSchoolFare(schoolId);
  }

  @Patch('school/:schoolId/fare')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async updateSchoolFare(
    @Param('schoolId') schoolId: string,
    @Body() updateFareDto: UpdateFareDto,
    @Req() req: any,
  ) {
    const adminId = req.user.userId;
    return this.adminService.updateCompanyFare(
      schoolId,
      updateFareDto.newFare,
      adminId,
      updateFareDto.reason,
    );
  }

  @Get('school/:schoolId/fare/history')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getFareHistory(@Param('schoolId') schoolId: string) {
    return this.adminService.getFareHistory(schoolId);
  }

  @Get('school/:schoolId/payment-plans')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getSchoolPaymentPlans(@Param('schoolId') schoolId: string) {
    // TODO: Implement payment plans feature
    // For now, return empty array to prevent 404 error
    return [];
  }
}
