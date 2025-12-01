import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestStatus } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class EarlyPickupRequestsService {
  constructor(
    private prisma: PrismaService,
    private realtimeGateway?: RealtimeGateway,
  ) {}

  // Parent requests early pickup
  async requestEarlyPickup(
    childId: string,
    tripId: string,
    parentId: string,
    reason?: string,
  ): Promise<any> {
    // Check if request already exists
    const existing = await this.prisma.earlyPickupRequest.findUnique({
      where: { childId_tripId: { childId, tripId } },
    });

    if (existing && existing.status === RequestStatus.PENDING) {
      throw new Error('Early pickup request already exists for this trip');
    }

    const request = await this.prisma.earlyPickupRequest.create({
      data: {
        childId,
        tripId,
        requestedBy: parentId,
        reason,
        status: RequestStatus.PENDING,
      },
      include: {
        child: true,
        trip: true,
        requestedByUser: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
    });

    // Notify driver
    if (this.realtimeGateway) {
      await this.realtimeGateway.server.to(`trip:${tripId}`).emit('early_pickup_requested', {
        requestId: request.id,
        childName: `${request.child.firstName} ${request.child.lastName}`,
        parentName: request.requestedByUser.firstName,
        reason,
        timestamp: new Date(),
      });
    }

    return request;
  }

  // Driver/Admin approves early pickup
  async approveEarlyPickup(requestId: string, approvedBy: string): Promise<any> {
    const request = await this.prisma.earlyPickupRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.APPROVED,
        approvedBy,
        approvedAt: new Date(),
      },
      include: {
        child: true,
        trip: true,
        requestedByUser: true,
      },
    });

    // Notify parent
    if (this.realtimeGateway) {
      await this.realtimeGateway.server
        .to(`user:${request.requestedBy}`)
        .emit('early_pickup_approved', {
          childName: `${request.child.firstName} ${request.child.lastName}`,
          timestamp: new Date(),
        });
    }

    return request;
  }

  // Driver/Admin rejects early pickup
  async rejectEarlyPickup(requestId: string, rejectionReason?: string): Promise<any> {
    const request = await this.prisma.earlyPickupRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.REJECTED,
        rejectionReason,
      },
      include: {
        child: true,
        requestedByUser: true,
      },
    });

    // Notify parent
    if (this.realtimeGateway) {
      await this.realtimeGateway.server
        .to(`user:${request.requestedBy}`)
        .emit('early_pickup_rejected', {
          childName: `${request.child.firstName} ${request.child.lastName}`,
          reason: rejectionReason,
          timestamp: new Date(),
        });
    }

    return request;
  }

  // Parent cancels their request
  async cancelRequest(requestId: string): Promise<any> {
    const request = await this.prisma.earlyPickupRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status === RequestStatus.APPROVED) {
      throw new Error('Cannot cancel this request');
    }

    return this.prisma.earlyPickupRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.CANCELLED,
      },
    });
  }

  // Get pending requests for a trip
  async getPendingRequestsForTrip(tripId: string): Promise<any[]> {
    return this.prisma.earlyPickupRequest.findMany({
      where: {
        tripId,
        status: RequestStatus.PENDING,
      },
      include: {
        child: true,
        requestedByUser: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
    });
  }

  // Get requests for a parent
  async getParentRequests(parentId: string): Promise<any[]> {
    return this.prisma.earlyPickupRequest.findMany({
      where: { requestedBy: parentId },
      include: {
        child: true,
        trip: true,
      },
      orderBy: { requestedTime: 'desc' },
    });
  }

  // Get approved requests (children eligible for early pickup)
  async getApprovedRequestsForTrip(tripId: string): Promise<any[]> {
    return this.prisma.earlyPickupRequest.findMany({
      where: {
        tripId,
        status: RequestStatus.APPROVED,
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
}
