import { PrismaService } from '../../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    private readonly redis;
    constructor(prisma: PrismaService);
    getRoutePerformance(routeId: string): Promise<any>;
    getMissedPickups(): Promise<any>;
    getTripSuccessRate(): Promise<any>;
    getPaymentCompletionRate(): Promise<any>;
    private isTripOnTime;
    private calculateAverageDuration;
}
