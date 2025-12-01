import { Module } from '@nestjs/common';
import { TripExceptionsService } from './trip-exceptions.service';
import { TripExceptionsController } from './trip-exceptions.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TripExceptionsController],
  providers: [TripExceptionsService],
  exports: [TripExceptionsService],
})
export class TripExceptionsModule {}
