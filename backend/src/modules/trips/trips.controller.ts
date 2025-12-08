import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripAutomationService } from './trip-automation.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
    private readonly tripAutomationService: TripAutomationService,
  ) {}

  @Post()
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  create(@Body() createTripDto: any) {
    return this.tripsService.create(createTripDto);
  }

  @Get()
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER')
  findAll() {
    return this.tripsService.findAll();
  }

  @Get(':id')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Get('child/:childId')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT')
  findActiveByChild(@Param('childId') childId: string) {
    return this.tripsService.findActiveByChildId(childId);
  }

  @Patch(':id')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER')
  update(@Param('id') id: string, @Body() updateTripDto: any) {
    return this.tripsService.update(id, updateTripDto);
  }

  @Patch(':id/status')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER')
  transitionStatus(@Param('id') id: string, @Body() statusDto: any) {
    return this.tripsService.transitionTripStatus(id, statusDto.status, statusDto.userId);
  }

  @Delete(':id')
  @Roles('PLATFORM_ADMIN')
  remove(@Param('id') id: string) {
    return this.tripsService.remove(id);
  }

  @Post('generate-today')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async generateTodayTrips() {
    await this.tripAutomationService.generateTripsManually();
    return { message: 'Trip generation triggered successfully' };
  }
}