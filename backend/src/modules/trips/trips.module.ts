import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { TripAutomationService } from './trip-automation.service';
import { TripCleanupService } from './cleanup-trips.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TripsController],
  providers: [TripsService, TripAutomationService, TripCleanupService],
  exports: [TripsService, TripAutomationService],
})
export class TripsModule {}