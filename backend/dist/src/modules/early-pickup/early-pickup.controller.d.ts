import { EarlyPickupRequestsService } from './early-pickup.service';
export declare class EarlyPickupController {
    private readonly earlyPickupService;
    constructor(earlyPickupService: EarlyPickupRequestsService);
    requestEarlyPickup(data: {
        childId: string;
        tripId: string;
        reason?: string;
    }, req: any): Promise<any>;
    approveRequest(requestId: string, req: any): Promise<any>;
    rejectRequest(requestId: string, data: {
        reason?: string;
    }): Promise<any>;
    cancelRequest(requestId: string): Promise<any>;
    getPendingRequests(tripId: string): Promise<any[]>;
    getApprovedRequests(tripId: string): Promise<any[]>;
    getParentRequests(parentId: string): Promise<any[]>;
}
