import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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

  @Get('companies/:companyId')
  @Roles('PLATFORM_ADMIN')
  async getCompanyById(@Param('companyId') companyId: string) {
    return this.adminService.getCompanyById(companyId);
  }
}