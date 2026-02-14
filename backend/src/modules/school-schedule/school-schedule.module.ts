import { Module } from '@nestjs/common';
import { SchoolScheduleController } from './school-schedule.controller';
import { SchoolScheduleService } from './school-schedule.service';

@Module({
  controllers: [SchoolScheduleController],
  providers: [SchoolScheduleService],
  exports: [SchoolScheduleService],
})
export class SchoolScheduleModule {}
