import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';

@Controller('school')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get('routes')
  @Roles('SCHOOL_ADMIN')
  async getSchoolRoutes(@Req() req: any) {
    const schoolId = req.user.schoolId;
    return this.schoolsService.getRoutes(schoolId);
  }

  @Get('children')
  @Roles('SCHOOL_ADMIN')
  async getSchoolChildren(@Req() req: any) {
    const schoolId = req.user.schoolId;
    return this.schoolsService.getChildren(schoolId);
  }

  @Get('drivers')
  @Roles('SCHOOL_ADMIN')
  async getSchoolDrivers(@Req() req: any) {
    const schoolId = req.user.schoolId;
    return this.schoolsService.getDrivers(schoolId);
  }

  @Get('buses')
  @Roles('SCHOOL_ADMIN')
  async getSchoolBuses(@Req() req: any) {
    const schoolId = req.user.schoolId;
    return this.schoolsService.getBuses(schoolId);
  }

  @Get('trips')
  @Roles('SCHOOL_ADMIN')
  async getSchoolTrips(@Req() req: any, @Query('date') date?: string) {
    const schoolId = req.user.schoolId;
    return this.schoolsService.getTrips(schoolId, date);
  }

  @Post('drivers')
  @Roles('SCHOOL_ADMIN')
  async createDriver(@Req() req: any, @Body() dto: any) {
    const schoolId = req.user.schoolId;
    return this.schoolsService.createDriver(schoolId, dto);
  }

  @Post('buses')
  @Roles('SCHOOL_ADMIN')
  async createBus(@Req() req: any, @Body() dto: any) {
    const schoolId = req.user.schoolId;
    return this.schoolsService.createBus(schoolId, dto);
  }

  @Post('routes')
  @Roles('SCHOOL_ADMIN')
  async createRoute(@Req() req: any, @Body() dto: any) {
    const schoolId = req.user.schoolId;
    return this.schoolsService.createRoute(schoolId, dto);
  }

  @Post('scheduled-routes')
  @Roles('SCHOOL_ADMIN')
  async createScheduledRoute(@Req() req: any, @Body() dto: any) {
    const schoolId = req.user.schoolId;
    return this.schoolsService.createScheduledRoute(schoolId, dto);
  }

  @Post('children/bulk-onboard')
  @Roles('SCHOOL_ADMIN')
  async bulkOnboardChildren(@Req() req: any, @Body() dto: any) {
    const schoolId = req.user.schoolId;
    return this.schoolsService.bulkOnboardChildren(schoolId, dto);
  }

  @Get('analytics')
  @Roles('SCHOOL_ADMIN')
  async getSchoolAnalytics(@Req() req: any, @Query('range') range?: string) {
    const schoolId = req.user.schoolId;
    return this.schoolsService.getAnalytics(schoolId, range);
  }

  @Patch('fare')
  @Roles('SCHOOL_ADMIN')
  async updateFare(@Req() req: any, @Body() dto: any) {
    const schoolId = req.user.schoolId;
    const userId = req.user.id;
    return this.schoolsService.updateFare(schoolId, dto.newFare, userId, dto.reason);
  }
}