import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SchoolScheduleService } from './school-schedule.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScheduleType } from '@prisma/client';

@Controller('school-schedule')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolScheduleController {
  constructor(private readonly schoolScheduleService: SchoolScheduleService) {}

  @Post()
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  create(@Body() createDto: {
    schoolId: string;
    title: string;
    description?: string;
    scheduleType: ScheduleType;
    date: string;
    adjustedStartTime?: string;
    adjustedEndTime?: string;
    tripsEnabled?: boolean;
  }) {
    return this.schoolScheduleService.createSchedule({
      ...createDto,
      date: new Date(createDto.date),
      adjustedStartTime: createDto.adjustedStartTime ? new Date(createDto.adjustedStartTime) : undefined,
      adjustedEndTime: createDto.adjustedEndTime ? new Date(createDto.adjustedEndTime) : undefined,
    });
  }

  @Get('school/:schoolId')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  findAll(
    @Param('schoolId') schoolId: string,
  ) {
    return this.schoolScheduleService.getSchedulesBySchool(schoolId);
  }

  @Get('school/:schoolId/date/:date')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  findForDate(
    @Param('schoolId') schoolId: string,
    @Param('date') date: string,
  ) {
    return this.schoolScheduleService.getScheduleForDate(schoolId, new Date(date));
  }

  @Patch(':id')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateDto: {
      title?: string;
      description?: string;
      scheduleType?: ScheduleType;
      date?: string;
      adjustedStartTime?: string;
      adjustedEndTime?: string;
      tripsEnabled?: boolean;
    },
  ) {
    return this.schoolScheduleService.updateSchedule(id, {
      ...updateDto,
      date: updateDto.date ? new Date(updateDto.date) : undefined,
      adjustedStartTime: updateDto.adjustedStartTime ? new Date(updateDto.adjustedStartTime) : undefined,
      adjustedEndTime: updateDto.adjustedEndTime ? new Date(updateDto.adjustedEndTime) : undefined,
    });
  }

  @Delete(':id')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  remove(@Param('id') id: string) {
    return this.schoolScheduleService.deleteSchedule(id);
  }

  @Post(':id/notify')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  notifyParents(@Param('id') id: string) {
    return this.schoolScheduleService.notifyParentsOfScheduleChange(id);
  }
}
