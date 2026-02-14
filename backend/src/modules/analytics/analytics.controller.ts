import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';

@Controller('analytics')
@UseGuards(RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('route/:routeId')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getRoutePerformance(@Param('routeId') routeId: string) {
    return this.analyticsService.getRoutePerformance(routeId);
  }

  @Get('missed-pickups')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getMissedPickups() {
    return this.analyticsService.getMissedPickups();
  }

  @Get('trip-success-rate')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getTripSuccessRate() {
    return this.analyticsService.getTripSuccessRate();
  }

  @Get('payment-completion-rate')
  @Roles('PLATFORM_ADMIN', 'SCHOOL_ADMIN')
  async getPaymentCompletionRate() {
    return this.analyticsService.getPaymentCompletionRate();
  }
}