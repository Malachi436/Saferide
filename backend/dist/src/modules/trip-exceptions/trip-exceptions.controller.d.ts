import { TripExceptionsService } from './trip-exceptions.service';
export declare class TripExceptionsController {
    private readonly tripExceptionsService;
    constructor(tripExceptionsService: TripExceptionsService);
    skipTrip(data: {
        childId: string;
        tripId: string;
        reason?: string;
    }): Promise<any>;
    cancelSkipTrip(childId: string, tripId: string): Promise<any>;
    getTripExceptions(tripId: string): Promise<any[]>;
    getChildExceptions(childId: string): Promise<any[]>;
}
