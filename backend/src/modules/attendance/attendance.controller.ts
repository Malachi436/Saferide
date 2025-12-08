import { Controller, Post, Body, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { AttendanceStatus } from '@prisma/client';

class RecordAttendanceDto {
  childId: string;
  tripId: string;
  status: AttendanceStatus;
  recordedBy: string;
}

@Controller('attendance')
@UseGuards(RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles('DRIVER')
  async recordAttendance(@Body() recordAttendanceDto: RecordAttendanceDto) {
    return this.attendanceService.recordAttendance(
      recordAttendanceDto.childId,
      recordAttendanceDto.tripId,
      recordAttendanceDto.status,
      recordAttendanceDto.recordedBy
    );
  }

  @Patch(':id')
  @Roles('DRIVER')
  async updateAttendance(@Param('id') id: string, @Body() updateDto: any) {
    return this.attendanceService.updateAttendance(
      id,
      updateDto.status,
      updateDto.recordedBy
    );
  }

  @Get('child/:childId')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT')
  async getAttendanceByChild(@Param('childId') childId: string) {
    return this.attendanceService.getAttendanceByChild(childId);
  }

  @Get('trip/:tripId')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER')
  async getAttendanceByTrip(@Param('tripId') tripId: string) {
    return this.attendanceService.getAttendanceByTrip(tripId);
  }

  @Get(':id')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER')
  async getAttendanceById(@Param('id') id: string) {
    return this.attendanceService.getAttendanceById(id);
  }
}