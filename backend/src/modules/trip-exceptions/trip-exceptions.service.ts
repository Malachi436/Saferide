import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TripExceptionsService {
  constructor(private prisma: PrismaService) {}

  // Skip trip for a child (they won't use the bus that day)
  async skipTrip(childId: string, tripId: string, reason?: string): Promise<any> {
    // Check if exception already exists
    const existing = await this.prisma.tripException.findUnique({
      where: { childId_tripId: { childId, tripId } },
    });

    if (existing) {
      // Update existing
      return this.prisma.tripException.update({
        where: { id: existing.id },
        data: {
          reason,
          status: 'ACTIVE',
        },
      });
    }

    // Create new exception
    return this.prisma.tripException.create({
      data: {
        childId,
        tripId,
        reason,
        type: 'SKIP_TRIP',
        status: 'ACTIVE',
        date: new Date(),
      },
      include: {
        child: true,
        trip: true,
      },
    });
  }

  // Cancel a trip skip
  async cancelSkipTrip(childId: string, tripId: string): Promise<any> {
    return this.prisma.tripException.update({
      where: { childId_tripId: { childId, tripId } },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  // Get all exceptions for a trip
  async getTripExceptions(tripId: string): Promise<any[]> {
    return this.prisma.tripException.findMany({
      where: {
        tripId,
        status: 'ACTIVE',
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  // Get exceptions for a child
  async getChildExceptions(childId: string): Promise<any[]> {
    return this.prisma.tripException.findMany({
      where: { childId },
      include: { trip: true },
      orderBy: { date: 'desc' },
    });
  }

  // Get exceptions for a specific date
  async getExceptionsByDate(date: Date): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.tripException.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: 'ACTIVE',
      },
      include: {
        child: true,
        trip: true,
      },
    });
  }
}
