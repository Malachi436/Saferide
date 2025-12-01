import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Driver } from '@prisma/client';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<Driver | null> {
    return this.prisma.driver.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Driver | null> {
    return this.prisma.driver.findUnique({
      where: { userId },
    });
  }

  async findByLicense(license: string): Promise<Driver | null> {
    return this.prisma.driver.findUnique({
      where: { license },
    });
  }

  async create(data: any): Promise<Driver> {
    return this.prisma.driver.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<Driver> {
    return this.prisma.driver.update({
      where: { id },
      data,
    });
  }

  async findAll(): Promise<Driver[]> {
    return this.prisma.driver.findMany();
  }

  async remove(id: string): Promise<Driver> {
    return this.prisma.driver.delete({
      where: { id },
    });
  }

  async getTodayTrip(driverId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.trip.findFirst({
      where: {
        driverId,
        startTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        bus: {
          include: {
            locations: true,
          },
        },
        route: {
          include: {
            stops: true,
          },
        },
        attendances: {
          include: {
            child: true,
          },
        },
      },
    });
  }
}