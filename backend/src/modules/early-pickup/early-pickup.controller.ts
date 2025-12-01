import { Controller, Post, Get, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { EarlyPickupRequestsService } from './early-pickup.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('early-pickup')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EarlyPickupController {
  constructor(private readonly earlyPickupService: EarlyPickupRequestsService) {}

  @Post('request')
  @Roles('PARENT')
  async requestEarlyPickup(
    @Body() data: { childId: string; tripId: string; reason?: string },
    @Req() req: any,
  ) {
    const parentId = req.user.sub; // JWT payload user id
    return this.earlyPickupService.requestEarlyPickup(
      data.childId,
      data.tripId,
      parentId,
      data.reason,
    );
  }

  @Put(':requestId/approve')
  @Roles('DRIVER', 'COMPANY_ADMIN')
  async approveRequest(
    @Param('requestId') requestId: string,
    @Req() req: any,
  ) {
    const approvedBy = req.user.sub;
    return this.earlyPickupService.approveEarlyPickup(requestId, approvedBy);
  }

  @Put(':requestId/reject')
  @Roles('DRIVER', 'COMPANY_ADMIN')
  async rejectRequest(
    @Param('requestId') requestId: string,
    @Body() data: { reason?: string },
  ) {
    return this.earlyPickupService.rejectEarlyPickup(requestId, data.reason);
  }

  @Put(':requestId/cancel')
  @Roles('PARENT')
  async cancelRequest(
    @Param('requestId') requestId: string,
  ) {
    return this.earlyPickupService.cancelRequest(requestId);
  }

  @Get('trip/:tripId/pending')
  @Roles('DRIVER', 'COMPANY_ADMIN')
  async getPendingRequests(@Param('tripId') tripId: string) {
    return this.earlyPickupService.getPendingRequestsForTrip(tripId);
  }

  @Get('trip/:tripId/approved')
  @Roles('DRIVER', 'COMPANY_ADMIN', 'PARENT')
  async getApprovedRequests(@Param('tripId') tripId: string) {
    return this.earlyPickupService.getApprovedRequestsForTrip(tripId);
  }

  @Get('parent/:parentId')
  @Roles('PARENT', 'COMPANY_ADMIN')
  async getParentRequests(@Param('parentId') parentId: string) {
    return this.earlyPickupService.getParentRequests(parentId);
  }
}
