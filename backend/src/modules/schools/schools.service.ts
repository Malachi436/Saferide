import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  async getRoutes(schoolId: string) {
    return this.prisma.route.findMany({
      where: { schoolId },
      include: {
        bus: { include: { driver: { include: { user: true } } } },
        stops: { orderBy: { order: 'asc' } },
        _count: { select: { children: true } }
      }
    });
  }

  async getChildren(schoolId: string) {
    return this.prisma.child.findMany({
      where: { schoolId },
      include: {
        parent: true,
        route: { include: { bus: true } },
        school: true
      }
    });
  }

  async getDrivers(schoolId: string) {
    return this.prisma.driver.findMany({
      where: {
        OR: [
          { user: { schoolId } },
          { buses: { some: { schoolId } } }
        ]
      },
      include: {
        user: true,
        buses: true
      }
    });
  }

  async getBuses(schoolId: string) {
    return this.prisma.bus.findMany({
      where: { schoolId },
      include: {
        driver: { include: { user: true } },
        _count: { select: { routes: true } }
      }
    });
  }

  async getTrips(schoolId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    return this.prisma.trip.findMany({
      where: {
        route: { schoolId },
        startTime: { gte: startOfDay, lte: endOfDay }
      },
      include: {
        route: true,
        bus: true,
        driver: { include: { user: true } },
        attendances: { include: { child: true } }
      },
      orderBy: { startTime: 'asc' }
    });
  }

  async createDriver(schoolId: string, dto: any) {
    // Hash password
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: 'DRIVER',
        schoolId
      }
    });

    return this.prisma.driver.create({
      data: {
        license: dto.license,
        userId: user.id
      },
      include: { user: true }
    });
  }

  async createBus(schoolId: string, dto: any) {
    return this.prisma.bus.create({
      data: {
        plateNumber: dto.plateNumber,
        capacity: dto.capacity,
        schoolId
      }
    });
  }

  async createRoute(schoolId: string, dto: any) {
    return this.prisma.route.create({
      data: {
        name: dto.name,
        schoolId,
        busId: dto.busId,
        shift: dto.shift,
        stops: {
          create: dto.stops.map((stop: any, index: number) => ({
            name: stop.name,
            latitude: stop.latitude,
            longitude: stop.longitude,
            order: index + 1
          }))
        }
      },
      include: { stops: true }
    });
  }

  async createScheduledRoute(schoolId: string, dto: any) {
    // Verify the route, driver, and bus belong to the same school
    const [route, driver, bus] = await Promise.all([
      this.prisma.route.findUnique({ where: { id: dto.routeId } }),
      this.prisma.driver.findUnique({ where: { id: dto.driverId }, include: { user: true } }),
      this.prisma.bus.findUnique({ where: { id: dto.busId } })
    ]);

    if (!route || route.schoolId !== schoolId) {
      throw new BadRequestException('Route not found or does not belong to your school');
    }

    if (!driver || driver.user.schoolId !== schoolId) {
      throw new BadRequestException('Driver not found or does not belong to your school');
    }

    if (!bus || bus.schoolId !== schoolId) {
      throw new BadRequestException('Bus not found or does not belong to your school');
    }

    return this.prisma.scheduledRoute.create({
      data: {
        routeId: dto.routeId,
        driverId: dto.driverId,
        busId: dto.busId,
        scheduledTime: dto.scheduledTime,
        recurringDays: dto.recurringDays,
        autoAssignChildren: dto.autoAssignChildren ?? true,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : null,
        effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : null
      }
    });
  }

  async bulkOnboardChildren(schoolId: string, dto: any) {
    const createdChildren = await this.prisma.$transaction(
      dto.children.map((childData: any) => 
        this.prisma.child.create({
          data: {
            firstName: childData.firstName,
            lastName: childData.lastName,
            dateOfBirth: new Date(childData.dateOfBirth),
            grade: childData.grade,
            schoolId,
            parentPhone: childData.parentPhone,
            routeId: childData.routeId || null,
            daysUntilPayment: childData.daysUntilPayment || 0,
            uniqueCode: this.generateUniqueCode(),
            isClaimed: false,
            pickupType: 'SCHOOL'
          }
        })
      )
    );
    return { created: createdChildren.length, children: createdChildren };
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async getAnalytics(schoolId: string, range?: string) {
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [totalTrips, completedTrips, totalChildren, activeChildren, 
            missedPickups] = await Promise.all([
      this.prisma.trip.count({
        where: { route: { schoolId }, createdAt: { gte: startDate } }
      }),
      this.prisma.trip.count({
        where: { route: { schoolId }, status: 'COMPLETED', createdAt: { gte: startDate } }
      }),
      this.prisma.child.count({ where: { schoolId } }),
      this.prisma.child.count({
        where: { 
          schoolId,
          attendance: { some: { trip: { status: 'IN_PROGRESS' } } }
        }
      }),
      this.prisma.childAttendance.count({
        where: { 
          child: { schoolId }, 
          status: 'MISSED',
          createdAt: { gte: startDate } 
        }
      })
    ]);

    return {
      totalTrips,
      completedTrips,
      totalChildren,
      activeChildren,
      missedPickups,
      onTimeRate: totalTrips > 0 ? ((completedTrips / totalTrips) * 100).toFixed(2) : 0
    };
  }

  async updateFare(schoolId: string, newFare: number, changedBy: string, reason?: string) {
    const school = await this.prisma.school.findUnique({ where: { id: schoolId } });
    const oldFare = school.baseFare;
    
    const updated = await this.prisma.school.update({
      where: { id: schoolId },
      data: { baseFare: newFare }
    });

    // Create fare history
    await this.prisma.fareHistory.create({
      data: {
        schoolId,
        oldFare,
        newFare,
        changedBy,
        reason
      }
    });

    return updated;
  }
}