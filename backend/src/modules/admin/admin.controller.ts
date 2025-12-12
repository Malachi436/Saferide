import { Controller, Get, Post, Body, Param, UseGuards, Delete, Put, Query, UploadedFile, UseInterceptors, Req, Patch } from '@nestjs/common';
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

  @Get('stats/company/:companyId')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async getCompanyStats(@Param('companyId') companyId: string) {
    return this.adminService.getCompanyStats(companyId);
  }

  @Post('company')
  @Roles('PLATFORM_ADMIN')
  async createCompany(@Body() createCompanyDto: any) {
    return this.adminService.createCompany(createCompanyDto);
  }

  @Post('school/:companyId')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async createSchool(@Param('companyId') companyId: string, @Body() createSchoolDto: any) {
    return this.adminService.createSchool(companyId, createSchoolDto);
  }

  @Get('companies')
  @Roles('PLATFORM_ADMIN')
  async getAllCompanies() {
    return this.adminService.getAllCompanies();
  }

  @Get('schools')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async getAllSchools() {
    return this.adminService.getAllSchools();
  }

  @Get('company/:companyId/schools')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async getCompanySchools(@Param('companyId') companyId: string) {
    return this.adminService.getCompanySchools(companyId);
  }

  @Get('company/:companyId/children')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async getCompanyChildren(@Param('companyId') companyId: string) {
    return this.adminService.getCompanyChildren(companyId);
  }

  @Get('company/:companyId/children/payments')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async getChildrenPayments(@Param('companyId') companyId: string) {
    return this.adminService.getChildrenPaymentStatus(companyId);
  }

  @Get('company/:companyId/drivers')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async getCompanyDrivers(@Param('companyId') companyId: string) {
    return this.adminService.getCompanyDrivers(companyId);
  }

  @Post('driver/:driverId/photo')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
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
    return this.adminService.getCompanyById(companyId);
  }

  @Delete('company/:companyId')
  @Roles('PLATFORM_ADMIN')
  async deleteCompany(@Param('companyId') companyId: string) {
    return this.adminService.deleteCompany(companyId);
  }

  @Put('school/:schoolId')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async updateSchool(@Param('schoolId') schoolId: string, @Body() updateSchoolDto: any) {
    return this.adminService.updateSchool(schoolId, updateSchoolDto);
  }

  @Delete('school/:schoolId')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async deleteSchool(@Param('schoolId') schoolId: string) {
    return this.adminService.deleteSchool(schoolId);
  }

  @Get('company/:companyId/analytics')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async getCompanyAnalytics(@Param('companyId') companyId: string, @Query('range') range?: string) {
    return this.adminService.getCompanyAnalytics(companyId, range);
  }

  @Get('company/:companyId/trips')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async getCompanyTrips(@Param('companyId') companyId: string) {
    return this.adminService.getCompanyTrips(companyId);
  }

  @Get('company/:companyId/trips/active')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async getCompanyActiveTrips(@Param('companyId') companyId: string) {
    return this.adminService.getCompanyActiveTrips(companyId);
  }

  @Get('company/:companyId/reports/attendance')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async getAttendanceReport(@Param('companyId') companyId: string, @Query('range') range?: string) {
    return this.adminService.getAttendanceReport(companyId, range);
  }

  @Get('company/:companyId/reports/payments')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async getPaymentReport(@Param('companyId') companyId: string, @Query('range') range?: string) {
    return this.adminService.getPaymentReport(companyId, range);
  }

  @Get('company/:companyId/reports/driver-performance')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async getDriverPerformanceReport(@Param('companyId') companyId: string, @Query('range') range?: string) {
    return this.adminService.getDriverPerformanceReport(companyId, range);
  }

  // Fare Management
  @Get('company/:companyId/fare')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async getCompanyFare(@Param('companyId') companyId: string) {
    return this.adminService.getCompanyFare(companyId);
  }

  @Patch('company/:companyId/fare')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async updateCompanyFare(
    @Param('companyId') companyId: string,
    @Body() updateFareDto: UpdateFareDto,
    @Req() req: any,
  ) {
    const adminId = req.user.userId;
    return this.adminService.updateCompanyFare(
      companyId,
      updateFareDto.newFare,
      adminId,
      updateFareDto.reason,
    );
  }

  @Get('company/:companyId/fare/history')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async getFareHistory(@Param('companyId') companyId: string) {
    return this.adminService.getFareHistory(companyId);
  }
}
