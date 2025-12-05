import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export declare class EarlyPickupRequestsService {
    private prisma;
    private realtimeGateway?;
    constructor(prisma: PrismaService, realtimeGateway?: RealtimeGateway);
    requestEarlyPickup(childId: string, tripId: string, parentId: string, reason?: string, timeOfDay?: string): Promise<any>;
    approveEarlyPickup(requestId: string, approvedBy: string): Promise<any>;
    rejectEarlyPickup(requestId: string, rejectionReason?: string): Promise<any>;
    cancelRequest(requestId: string): Promise<any>;
    getPendingRequestsForTrip(tripId: string): Promise<any[]>;
    getParentRequests(parentId: string): Promise<any[]>;
    getApprovedRequestsForTrip(tripId: string): Promise<any[]>;
}
