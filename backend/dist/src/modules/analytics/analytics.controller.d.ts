import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getRoutePerformance(routeId: string): Promise<any>;
    getMissedPickups(): Promise<any>;
    getTripSuccessRate(): Promise<any>;
    getPaymentCompletionRate(): Promise<any>;
}
