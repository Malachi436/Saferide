import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ScheduledRoutesService } from './scheduled-routes.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DayOfWeek } from '@prisma/client';

@Controller('scheduled-routes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScheduledRoutesController {
  constructor(private readonly scheduledRoutesService: ScheduledRoutesService) {}

  @Post()
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  create(@Body() data: {
    routeId: string;
    driverId: string;
    busId: string;
    scheduledTime: string;
    recurringDays: DayOfWeek[];
    effectiveFrom?: string;
    effectiveUntil?: string;
  }) {
    return this.scheduledRoutesService.create({
      ...data,
      effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : undefined,
      effectiveUntil: data.effectiveUntil ? new Date(data.effectiveUntil) : undefined,
    });
  }

  @Get()
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN', 'DRIVER')
  findAll() {
    return this.scheduledRoutesService.findAll();
  }

  @Get('school/:schoolId')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  findBySchool(@Param('schoolId') schoolId: string) {
    return this.scheduledRoutesService.findBySchool(schoolId);
  }

  @Get('today')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  findToday() {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const today = days[new Date().getDay()] as DayOfWeek;
    return this.scheduledRoutesService.findActiveForDay(today);
  }

  @Get(':id')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN', 'DRIVER')
  findOne(@Param('id') id: string) {
    return this.scheduledRoutesService.findOne(id);
  }

  @Put(':id')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  update(@Param('id') id: string, @Body() data: any) {
    if (data.effectiveFrom) {
      data.effectiveFrom = new Date(data.effectiveFrom);
    }
    if (data.effectiveUntil) {
      data.effectiveUntil = new Date(data.effectiveUntil);
    }
    return this.scheduledRoutesService.update(id, data);
  }

  @Put(':id/suspend')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  suspend(@Param('id') id: string) {
    return this.scheduledRoutesService.suspend(id);
  }

  @Put(':id/activate')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  activate(@Param('id') id: string) {
    return this.scheduledRoutesService.activate(id);
  }

  @Delete(':id')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  delete(@Param('id') id: string) {
    return this.scheduledRoutesService.delete(id);
  }
}
