import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { TenancyModule } from './modules/tenancy/tenancy.module';
import { UsersModule } from './modules/users/users.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { ChildrenModule } from './modules/children/children.module';
import { BusesModule } from './modules/buses/buses.module';
import { RoutesModule } from './modules/routes/routes.module';
import { TripsModule } from './modules/trips/trips.module';
import { GpsModule } from './modules/gps/gps.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { TripExceptionsModule } from './modules/trip-exceptions/trip-exceptions.module';
import { EarlyPickupModule } from './modules/early-pickup/early-pickup.module';
import { ScheduledRoutesModule } from './modules/scheduled-routes/scheduled-routes.module';
import { HealthModule } from './modules/health/health.module';
import { EmailModule } from './modules/email/email.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { SchoolScheduleModule } from './modules/school-schedule/school-schedule.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Scheduling (for automated trip generation)
    ScheduleModule.forRoot(),
    
    // Logging
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
              return `[${timestamp}] ${level}: ${message}`;
            }),
          ),
        }),
      ],
    }),
    
    // Feature modules
    AuthModule,
    RolesModule,
    TenancyModule,
    UsersModule,
    DriversModule,
    ChildrenModule,
    BusesModule,
    RoutesModule,
    TripsModule,
    GpsModule,
    AttendanceModule,
    NotificationsModule,
    PaymentsModule,
    AnalyticsModule,
    AdminModule,
    RealtimeModule,
    TripExceptionsModule,
    EarlyPickupModule,
    ScheduledRoutesModule,
    HealthModule,
    EmailModule,
    CompaniesModule,
    SchoolsModule,
        SchoolScheduleModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
