import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Bus } from '@prisma/client';

@Injectable()
export class BusesService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<Bus | null> {
    return this.prisma.bus.findUnique({
      where: { id },
    });
  }

  async findByPlateNumber(plateNumber: string): Promise<Bus | null> {
    return this.prisma.bus.findUnique({
      where: { plateNumber },
    });
  }

  async findByDriverId(driverId: string): Promise<Bus[]> {
    return this.prisma.bus.findMany({
      where: { driverId },
    });
  }

  async create(data: any): Promise<Bus> {
    return this.prisma.bus.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<Bus> {
    return this.prisma.bus.update({
      where: { id },
      data,
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.bus.findMany({
      include: {
        driver: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async findByCompanyId(companyId: string): Promise<any[]> {
    return this.prisma.bus.findMany({
      where: {
        driver: {
          user: { companyId },
        },
      },
      include: {
        driver: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string): Promise<Bus> {
    return this.prisma.bus.delete({
      where: { id },
    });
  }
}