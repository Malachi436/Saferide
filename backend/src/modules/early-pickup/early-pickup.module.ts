import { Module } from '@nestjs/common';
import { EarlyPickupRequestsService } from './early-pickup.service';
import { EarlyPickupController } from './early-pickup.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [PrismaModule, RealtimeModule],
  controllers: [EarlyPickupController],
  providers: [EarlyPickupRequestsService],
  exports: [EarlyPickupRequestsService],
})
export class EarlyPickupModule {}
