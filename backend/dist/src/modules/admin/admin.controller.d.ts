import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getPlatformStats(): Promise<any>;
    getCompanyStats(companyId: string): Promise<any>;
    createCompany(createCompanyDto: any): Promise<any>;
    createSchool(companyId: string, createSchoolDto: any): Promise<any>;
}
