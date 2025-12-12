import { TripExceptionsService } from './trip-exceptions.service';
export declare class TripExceptionsController {
    private tripExceptionsService;
    constructor(tripExceptionsService: TripExceptionsService);
    skipTrip(body: {
        childId: string;
        tripId: string;
        reason?: string;
    }, req: any): Promise<any>;
    cancelSkip(childId: string, tripId: string): Promise<any>;
    getTripExceptions(tripId: string): Promise<any[]>;
    getChildExceptions(childId: string): Promise<any[]>;
    unskipTrip(body: {
        childId: string;
        tripId: string;
        reason?: string;
    }, req: any): Promise<any>;
}
