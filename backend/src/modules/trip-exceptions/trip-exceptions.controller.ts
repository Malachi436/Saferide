import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TripExceptionsService } from './trip-exceptions.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('trip-exceptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripExceptionsController {
  constructor(private readonly tripExceptionsService: TripExceptionsService) {}

  @Post('skip')
  @Roles('PARENT')
  async skipTrip(
    @Body() data: { childId: string; tripId: string; reason?: string },
  ) {
    return this.tripExceptionsService.skipTrip(data.childId, data.tripId, data.reason);
  }

  @Delete(':childId/:tripId')
  @Roles('PARENT')
  async cancelSkipTrip(
    @Param('childId') childId: string,
    @Param('tripId') tripId: string,
  ) {
    return this.tripExceptionsService.cancelSkipTrip(childId, tripId);
  }

  @Get('trip/:tripId')
  @Roles('DRIVER', 'COMPANY_ADMIN')
  async getTripExceptions(@Param('tripId') tripId: string) {
    return this.tripExceptionsService.getTripExceptions(tripId);
  }

  @Get('child/:childId')
  @Roles('PARENT', 'COMPANY_ADMIN')
  async getChildExceptions(@Param('childId') childId: string) {
    return this.tripExceptionsService.getChildExceptions(childId);
  }
}
