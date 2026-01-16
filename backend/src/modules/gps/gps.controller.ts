import { Controller, Post, Body, Get, Param, UseGuards, Query } from '@nestjs/common';
import { GpsService } from './gps.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class HeartbeatDto {
  busId: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: Date;
}

@Controller('gps')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Post('heartbeat')
  @Roles('DRIVER')
  async processHeartbeat(@Body() heartbeatDto: HeartbeatDto) {
    return this.gpsService.processHeartbeat(
      heartbeatDto.busId,
      heartbeatDto.latitude,
      heartbeatDto.longitude,
      heartbeatDto.speed,
      new Date(heartbeatDto.timestamp)
    );
  }

  @Get('location/:busId')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER', 'PARENT')
  async getCurrentLocation(@Param('busId') busId: string) {
    return this.gpsService.getCurrentLocation(busId);
  }

  @Get('locations/:busId')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER')
  async getRecentLocations(
    @Param('busId') busId: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('limit') limit?: string,
  ) {
    return this.gpsService.getLocationHistory(
      busId,
      startTime ? new Date(startTime) : undefined,
      endTime ? new Date(endTime) : undefined,
      limit ? parseInt(limit) : 100,
    );
  }
}