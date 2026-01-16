import { AdminService } from './admin.service';
import { UpdateFareDto } from './dto/fare-management.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getPlatformStats(): Promise<any>;
    getCompanyStats(companyId: string, req: any): Promise<any>;
    createCompany(createCompanyDto: any): Promise<any>;
    createSchool(companyId: string, createSchoolDto: any): Promise<any>;
    getAllCompanies(): Promise<any>;
    getAllSchools(): Promise<any>;
    getCompanySchools(companyId: string): Promise<any>;
    getCompanyRoutes(companyId: string): Promise<any>;
    getCompanyChildren(companyId: string): Promise<any>;
    getChildrenPayments(companyId: string): Promise<any>;
    getCompanyDrivers(companyId: string): Promise<any>;
    uploadDriverPhoto(driverId: string, file: any): Promise<any>;
    getCompanyById(companyId: string): Promise<any>;
    deleteCompany(companyId: string): Promise<any>;
    updateSchool(schoolId: string, updateSchoolDto: any): Promise<any>;
    deleteSchool(schoolId: string): Promise<any>;
    getCompanyAnalytics(companyId: string, range?: string): Promise<any>;
    getCompanyTrips(companyId: string): Promise<any>;
    getCompanyActiveTrips(companyId: string): Promise<any>;
    getAttendanceReport(companyId: string, range?: string): Promise<any>;
    getPaymentReport(companyId: string, range?: string): Promise<any>;
    getDriverPerformanceReport(companyId: string, range?: string): Promise<any>;
    getCompanyFare(companyId: string): Promise<{
        name: string;
        id: string;
        baseFare: number;
        currency: string;
    }>;
    updateCompanyFare(companyId: string, updateFareDto: UpdateFareDto, req: any): Promise<{
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
    getFareHistory(companyId: string): Promise<{
        id: string;
        createdAt: Date;
        companyId: string;
        reason: string | null;
        oldFare: number;
        newFare: number;
        changedBy: string;
    }[]>;
    getCompanyPaymentPlans(companyId: string): Promise<any[]>;
}
