import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getPlatformStats(): Promise<any>;
    getCompanyStats(companyId: string): Promise<any>;
    createCompany(createCompanyDto: any): Promise<any>;
    createSchool(companyId: string, createSchoolDto: any): Promise<any>;
    getAllCompanies(): Promise<any>;
    getAllSchools(): Promise<any>;
    getCompanySchools(companyId: string): Promise<any>;
    getCompanyChildren(companyId: string): Promise<any>;
    getChildrenPayments(companyId: string): Promise<any>;
    getCompanyDrivers(companyId: string): Promise<any>;
    uploadDriverPhoto(driverId: string, file: any): Promise<any>;
    getCompanyById(companyId: string): Promise<any>;
    deleteCompany(companyId: string): Promise<any>;
}
