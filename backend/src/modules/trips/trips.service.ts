import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Trip, TripStatus } from '@prisma/client';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<Trip | null> {
    return this.prisma.trip.findUnique({
      where: { id },
      include: {
        histories: true,
      },
    });
  }

  async create(data: any): Promise<Trip> {
    return this.prisma.trip.create({
      data,
      include: {
        histories: true,
      },
    });
  }

  async update(id: string, data: any): Promise<Trip> {
    return this.prisma.trip.update({
      where: { id },
      data,
      include: {
        histories: true,
      },
    });
  }

  async findAll(): Promise<Trip[]> {
    return this.prisma.trip.findMany({
      include: {
        histories: true,
      },
    });
  }

  async findActiveByChildId(childId: string): Promise<Trip | null> {
    return this.prisma.trip.findFirst({
      where: {
        status: { in: ['IN_PROGRESS', 'ARRIVED_SCHOOL', 'RETURN_IN_PROGRESS'] },
        attendances: {
          some: {
            childId: childId,
          },
        },
      },
      include: {
        histories: true,
        attendances: {
          where: { childId: childId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string): Promise<Trip> {
    return this.prisma.trip.delete({
      where: { id },
    });
  }

  async transitionTripStatus(tripId: string, newStatus: TripStatus, userId: string): Promise<Trip> {
    // Get current trip
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    // Validate transition
    if (!this.isValidTransition(trip.status, newStatus)) {
      throw new Error(`Invalid status transition from ${trip.status} to ${newStatus}`);
    }

    // Update trip status
    const updatedTrip = await this.prisma.trip.update({
      where: { id: tripId },
      data: {
        status: newStatus,
        ...(newStatus === TripStatus.IN_PROGRESS && { startTime: new Date() }),
        ...(newStatus === TripStatus.COMPLETED && { endTime: new Date() }),
      },
      include: {
        histories: true,
      },
    });

    // Record history
    await this.prisma.tripHistory.create({
      data: {
        tripId: tripId,
        status: newStatus,
      },
    });

    return updatedTrip;
  }

  private isValidTransition(from: TripStatus, to: TripStatus): boolean {
    const validTransitions: Record<TripStatus, TripStatus[]> = {
      [TripStatus.SCHEDULED]: [TripStatus.IN_PROGRESS],
      [TripStatus.IN_PROGRESS]: [TripStatus.ARRIVED_SCHOOL],
      [TripStatus.ARRIVED_SCHOOL]: [TripStatus.RETURN_IN_PROGRESS],
      [TripStatus.RETURN_IN_PROGRESS]: [TripStatus.COMPLETED],
      [TripStatus.COMPLETED]: [],
    };

    return validTransitions[from].includes(to);
  }
}