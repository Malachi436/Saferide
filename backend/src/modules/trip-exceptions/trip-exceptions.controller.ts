import { Controller, Post, Delete, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TripExceptionsService } from './trip-exceptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('trip-exceptions')
@UseGuards(JwtAuthGuard)
export class TripExceptionsController {
  constructor(private tripExceptionsService: TripExceptionsService) {}

  @Post('/skip')
  async skipTrip(
    @Body() body: { childId: string; tripId: string; reason?: string },
    @Req() req: any,
  ) {
    return this.tripExceptionsService.skipTrip(body.childId, body.tripId, body.reason);
  }

  @Delete('/:childId/:tripId')
  async cancelSkip(@Param('childId') childId: string, @Param('tripId') tripId: string) {
    return this.tripExceptionsService.cancelSkipTrip(childId, tripId);
  }

  @Get('/trip/:tripId')
  async getTripExceptions(@Param('tripId') tripId: string) {
    return this.tripExceptionsService.getTripExceptions(tripId);
  }

  @Get('/child/:childId')
  async getChildExceptions(@Param('childId') childId: string) {
    return this.tripExceptionsService.getChildExceptions(childId);
  }

  @Post('/unskip')
  async unskipTrip(
    @Body() body: { childId: string; tripId: string; reason?: string },
    @Req() req: any,
  ) {
    const parentId = req.user.userId;
    return this.tripExceptionsService.unskipTrip(body.childId, body.tripId, parentId, body.reason);
  }
}
