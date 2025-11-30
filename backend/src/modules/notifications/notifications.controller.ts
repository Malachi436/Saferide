import { Controller, Post, Body, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationType } from '@prisma/client';

class CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.createNotification(
      createNotificationDto.userId,
      createNotificationDto.title,
      createNotificationDto.message,
      createNotificationDto.type
    );
  }

  @Get('user/:userId')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT', 'DRIVER')
  async getUserNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getUserNotifications(userId);
  }

  @Get('unread-count/:userId')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT', 'DRIVER')
  async getUnreadCount(@Param('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT', 'DRIVER')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}