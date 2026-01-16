import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AdminService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    getPlatformStats(): Promise<any>;
    getCompanyStats(companyId: string, user?: any): Promise<any>;
    createCompany(data: any): Promise<any>;
    createSchool(companyId: string, data: any): Promise<any>;
    getAllCompanies(): Promise<any>;
    getAllSchools(): Promise<any>;
    getCompanySchools(companyId: string): Promise<any>;
    getCompanyRoutes(companyId: string): Promise<any>;
    getCompanyChildren(companyId: string): Promise<any>;
    getChildrenPaymentStatus(companyId: string): Promise<any>;
    getCompanyDrivers(companyId: string): Promise<any>;
    saveDriverPhoto(driverId: string, file: any): Promise<any>;
    getCompanyById(companyId: string): Promise<any>;
    deleteCompany(companyId: string): Promise<any>;
    updateSchool(schoolId: string, data: any): Promise<any>;
    deleteSchool(schoolId: string): Promise<any>;
    getCompanyAnalytics(companyId: string, range?: string): Promise<any>;
    getCompanyTrips(companyId: string): Promise<any>;
    getCompanyActiveTrips(companyId: string): Promise<any>;
    getAttendanceReport(companyId: string, range?: string): Promise<any>;
    getPaymentReport(companyId: string, range?: string): Promise<any>;
    getDriverPerformanceReport(companyId: string, range?: string): Promise<any>;
    updateCompanyFare(companyId: string, newFare: number, adminId: string, reason?: string): Promise<{
        company: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            phone: string | null;
            address: string | null;
            baseFare: number;
            currency: string;
        };
        oldFare: number;
        newFare: number;
        change: number;
        parentsNotified: number;
    }>;
    getCompanyFare(companyId: string): Promise<{
        name: string;
        id: string;
        baseFare: number;
        currency: string;
    }>;
    getFareHistory(companyId: string): Promise<{
        id: string;
        createdAt: Date;
        companyId: string;
        reason: string | null;
        oldFare: number;
        newFare: number;
        changedBy: string;
    }[]>;
}
