import { AdminService } from './admin.service';
import { UpdateFareDto } from './dto/fare-management.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getPlatformStats(): Promise<any>;
    getSchoolStats(schoolId: string, req: any): Promise<any>;
    createCompany(createCompanyDto: any): Promise<any>;
    createSchool(createSchoolDto: any): Promise<any>;
    getAllCompanies(): Promise<void>;
    getAllSchools(): Promise<any>;
    getCompanySchools(schoolId: string): Promise<any>;
    getSchoolRoutes(schoolId: string): Promise<any>;
    getSchoolChildren(schoolId: string): Promise<any>;
    getChildrenPayments(schoolId: string): Promise<any>;
    getSchoolDrivers(schoolId: string): Promise<any>;
    uploadDriverPhoto(driverId: string, file: any): Promise<any>;
    getCompanyById(companyId: string): Promise<void>;
    deleteCompany(companyId: string): Promise<void>;
    updateSchool(schoolId: string, updateSchoolDto: any): Promise<any>;
    deleteSchool(schoolId: string): Promise<any>;
    getSchoolAnalytics(schoolId: string, range?: string): Promise<any>;
    getSchoolTrips(schoolId: string): Promise<any>;
    getSchoolActiveTrips(schoolId: string): Promise<any>;
    getAttendanceReport(schoolId: string, range?: string): Promise<any>;
    getPaymentReport(schoolId: string, range?: string): Promise<any>;
    getDriverPerformanceReport(schoolId: string, range?: string): Promise<any>;
    getSchoolFare(schoolId: string): Promise<{
        id: string;
        name: string;
        baseFare: number;
        currency: string;
    }>;
    updateSchoolFare(schoolId: string, updateFareDto: UpdateFareDto, req: any): Promise<{
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
    getFareHistory(schoolId: string): Promise<{
        id: string;
        schoolId: string;
        createdAt: Date;
        reason: string | null;
        oldFare: number;
        newFare: number;
        changedBy: string;
    }[]>;
    getSchoolPaymentPlans(schoolId: string): Promise<any[]>;
}
