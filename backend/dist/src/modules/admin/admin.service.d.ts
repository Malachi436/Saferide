import { PrismaService } from '../../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getPlatformStats(): Promise<any>;
    getCompanyStats(companyId: string): Promise<any>;
    createCompany(data: any): Promise<any>;
    createSchool(companyId: string, data: any): Promise<any>;
    getAllCompanies(): Promise<any>;
    getAllSchools(): Promise<any>;
    getCompanySchools(companyId: string): Promise<any>;
    getCompanyChildren(companyId: string): Promise<any>;
    getChildrenPaymentStatus(companyId: string): Promise<any>;
    getCompanyDrivers(companyId: string): Promise<any>;
    saveDriverPhoto(driverId: string, file: any): Promise<any>;
    getCompanyById(companyId: string): Promise<any>;
    deleteCompany(companyId: string): Promise<any>;
    updateSchool(schoolId: string, data: any): Promise<any>;
    deleteSchool(schoolId: string): Promise<any>;
    getCompanyAnalytics(companyId: string): Promise<any>;
    getCompanyTrips(companyId: string): Promise<any>;
    getCompanyActiveTrips(companyId: string): Promise<any>;
}
