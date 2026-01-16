import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripAutomationService } from './trip-automation.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
    private readonly tripAutomationService: TripAutomationService,
    private readonly prisma: PrismaService,
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
  async findActiveByChild(
    @Param('childId') childId: string,
    @Req() req,
  ) {
    // Security: Verify parent owns this child (if role is PARENT)
    if (req.user.role === 'PARENT') {
      const child = await this.prisma.child.findUnique({
        where: { id: childId },
        select: { parentId: true },
      });

      if (!child) {
        throw new NotFoundException('Child not found');
      }

      if (child.parentId !== req.user.userId) {
        throw new ForbiddenException('Access denied: Not your child');
      }
    }

    return this.tripsService.findActiveByChildId(childId);
  }

  @Get('company/:companyId/active')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  findActiveByCompany(@Param('companyId') companyId: string) {
    return this.tripsService.findActiveByCompanyId(companyId);
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
    return await this.tripAutomationService.generateTripsManually();
  }
}