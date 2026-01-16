import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Driver } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
    // Extract fields from data
    const { userId, firstName, lastName, email, phone, password, license, companyId, schoolId } = data;

    // Check if driver with this license already exists
    const existingDriver = await this.findByLicense(license);
    if (existingDriver) {
      throw new BadRequestException('Driver with this license already exists');
    }

    // If userId is provided, use existing user; otherwise create new user
    if (userId) {
      // Update existing user with DRIVER role and companyId
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          role: 'DRIVER',
          companyId,
        },
      });

      // Create driver record linked to existing user
      return this.prisma.driver.create({
        data: {
          license,
          userId,
        },
      });
    }

    // Original behavior: check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and driver in transaction
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          phone,
          passwordHash,
          role: 'DRIVER',
          companyId,
          schoolId,
        },
      });

      const driver = await tx.driver.create({
        data: {
          license,
          userId: user.id,
        },
      });

      return driver;
    });
  }

  async update(id: string, data: any): Promise<Driver> {
    return this.prisma.driver.update({
      where: { id },
      data,
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.driver.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        buses: true,
      },
    });
  }

  async remove(id: string): Promise<Driver> {
    const driver = await this.findOne(id);
    if (!driver) {
      throw new BadRequestException('Driver not found');
    }

    // Delete driver and user in transaction
    return this.prisma.$transaction(async (tx) => {
      // Delete driver first
      const deletedDriver = await tx.driver.delete({
        where: { id },
      });

      // Delete associated user
      await tx.user.delete({
        where: { id: driver.userId },
      });

      return deletedDriver;
    });
  }

  async getTodayTrip(driverId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('[getTodayTrip] Looking for trips for driverId:', driverId);
    console.log('[getTodayTrip] Date range:', today, 'to', tomorrow);

    // Priority 1: Find any IN_PROGRESS trip for this driver (active trip)
    let trip = await this.prisma.trip.findFirst({
      where: {
        driverId,
        status: 'IN_PROGRESS',
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

    console.log('[getTodayTrip] IN_PROGRESS trip found:', trip?.id || 'none');

    // Priority 2: If no IN_PROGRESS trip, look for today's trips by createdAt OR startTime
    if (!trip) {
      trip = await this.prisma.trip.findFirst({
        where: {
          driverId,
          OR: [
            {
              // Match trips created today
              createdAt: {
                gte: today,
                lt: tomorrow,
              },
            },
            {
              // Match trips with startTime today
              startTime: {
                gte: today,
                lt: tomorrow,
              },
            },
          ],
          status: {
            notIn: ['COMPLETED'], // Exclude completed trips
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

      console.log('[getTodayTrip] Today\'s SCHEDULED trip found:', trip?.id || 'none');
    }

    // If no trip found, return null
    if (!trip) {
      console.log('[getTodayTrip] No trip found for driver');
      return null;
    }

    console.log('[getTodayTrip] Trip found:', trip.id, 'with', trip.attendances?.length || 0, 'attendances');

    // Filter out children with pending parent pickup requests or trip exceptions
    if (trip.attendances && trip.attendances.length > 0) {
      const childIds = trip.attendances.map((a: any) => a.childId);

      // Get all pending parent pickup requests for this trip
      const pickupRequests = await this.prisma.earlyPickupRequest.findMany({
        where: {
          tripId: trip.id,
          status: 'PENDING',
          childId: { in: childIds },
        },
        select: { childId: true },
      });

      // Get all trip exceptions (skips) for this trip
      const tripExceptions = await this.prisma.tripException.findMany({
        where: {
          tripId: trip.id,
          status: 'ACTIVE',
          childId: { in: childIds },
        },
        select: { childId: true },
      });

      const exemptedChildIds = new Set();

      // Add children with pending pickup requests to exempted list
      pickupRequests.forEach((req: any) => {
        exemptedChildIds.add(req.childId);
      });

      // Add children with trip exceptions to exempted list
      tripExceptions.forEach((exc: any) => {
        exemptedChildIds.add(exc.childId);
      });

      // Filter attendances to exclude exempted children
      trip.attendances = trip.attendances.filter(
        (attendance: any) => !exemptedChildIds.has(attendance.childId)
      );

      console.log('[getTodayTrip] After filtering:', trip.attendances.length, 'attendances');
    }

    return trip;
  }
}