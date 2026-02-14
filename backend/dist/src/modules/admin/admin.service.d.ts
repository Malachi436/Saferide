import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AdminService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    getPlatformStats(): Promise<any>;
    getSchoolStats(schoolId: string, user?: any): Promise<any>;
    createCompany(data: any): Promise<any>;
    createSchool(data: any): Promise<any>;
    getAllSchools(): Promise<any>;
    getCompanySchools(schoolId: string): Promise<any>;
    getSchoolRoutes(schoolId: string): Promise<any>;
    getSchoolChildren(schoolId: string): Promise<any>;
    getChildrenPaymentStatus(schoolId: string): Promise<any>;
    getSchoolDrivers(schoolId: string): Promise<any>;
    saveDriverPhoto(driverId: string, file: any): Promise<any>;
    getCompanyById(companyId: string): Promise<any>;
    deleteCompany(companyId: string): Promise<any>;
    updateSchool(schoolId: string, data: any): Promise<any>;
    deleteSchool(schoolId: string): Promise<any>;
    getSchoolAnalytics(schoolId: string, range?: string): Promise<any>;
    getSchoolTrips(schoolId: string): Promise<any>;
    getSchoolActiveTrips(schoolId: string): Promise<any>;
    getAttendanceReport(schoolId: string, range?: string): Promise<any>;
    getPaymentReport(schoolId: string, range?: string): Promise<any>;
    getDriverPerformanceReport(schoolId: string, range?: string): Promise<any>;
    updateCompanyFare(schoolId: string, newFare: number, adminId: string, reason?: string): Promise<{
        school: {
            id: string;
            email: string | null;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            schoolCode: string | null;
            baseFare: number;
            currency: string;
            latitude: number | null;
            longitude: number | null;
            address: string | null;
        };
        oldFare: number;
        newFare: number;
        change: number;
        parentsNotified: number;
    }>;
    getSchoolFare(schoolId: string): Promise<{
        id: string;
        name: string;
        baseFare: number;
        currency: string;
    }>;
    getFareHistory(schoolId: string): Promise<{
        id: string;
        schoolId: string;
        createdAt: Date;
        reason: string | null;
        oldFare: number;
        newFare: number;
        changedBy: string;
    }[]>;
}
