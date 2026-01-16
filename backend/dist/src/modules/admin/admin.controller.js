"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const admin_service_1 = require("./admin.service");
const roles_decorator_1 = require("../roles/roles.decorator");
const roles_guard_1 = require("../roles/roles.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const fare_management_dto_1 = require("./dto/fare-management.dto");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getPlatformStats() {
        return this.adminService.getPlatformStats();
    }
    async getCompanyStats(companyId, req) {
        return this.adminService.getCompanyStats(companyId, req.user);
    }
    async createCompany(createCompanyDto) {
        return this.adminService.createCompany(createCompanyDto);
    }
    async createSchool(companyId, createSchoolDto) {
        return this.adminService.createSchool(companyId, createSchoolDto);
    }
    async getAllCompanies() {
        return this.adminService.getAllCompanies();
    }
    async getAllSchools() {
        return this.adminService.getAllSchools();
    }
    async getCompanySchools(companyId) {
        return this.adminService.getCompanySchools(companyId);
    }
    async getCompanyRoutes(companyId) {
        return this.adminService.getCompanyRoutes(companyId);
    }
    async getCompanyChildren(companyId) {
        return this.adminService.getCompanyChildren(companyId);
    }
    async getChildrenPayments(companyId) {
        return this.adminService.getChildrenPaymentStatus(companyId);
    }
    async getCompanyDrivers(companyId) {
        return this.adminService.getCompanyDrivers(companyId);
    }
    async uploadDriverPhoto(driverId, file) {
        return this.adminService.saveDriverPhoto(driverId, file);
    }
    async getCompanyById(companyId) {
        return this.adminService.getCompanyById(companyId);
    }
    async deleteCompany(companyId) {
        return this.adminService.deleteCompany(companyId);
    }
    async updateSchool(schoolId, updateSchoolDto) {
        return this.adminService.updateSchool(schoolId, updateSchoolDto);
    }
    async deleteSchool(schoolId) {
        return this.adminService.deleteSchool(schoolId);
    }
    async getCompanyAnalytics(companyId, range) {
        return this.adminService.getCompanyAnalytics(companyId, range);
    }
    async getCompanyTrips(companyId) {
        return this.adminService.getCompanyTrips(companyId);
    }
    async getCompanyActiveTrips(companyId) {
        return this.adminService.getCompanyActiveTrips(companyId);
    }
    async getAttendanceReport(companyId, range) {
        return this.adminService.getAttendanceReport(companyId, range);
    }
    async getPaymentReport(companyId, range) {
        return this.adminService.getPaymentReport(companyId, range);
    }
    async getDriverPerformanceReport(companyId, range) {
        return this.adminService.getDriverPerformanceReport(companyId, range);
    }
    async getCompanyFare(companyId) {
        return this.adminService.getCompanyFare(companyId);
    }
    async updateCompanyFare(companyId, updateFareDto, req) {
        const adminId = req.user.userId;
        return this.adminService.updateCompanyFare(companyId, updateFareDto.newFare, adminId, updateFareDto.reason);
    }
    async getFareHistory(companyId) {
        return this.adminService.getFareHistory(companyId);
    }
    async getCompanyPaymentPlans(companyId) {
        return [];
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPlatformStats", null);
__decorate([
    (0, common_1.Get)('stats/company/:companyId'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCompanyStats", null);
__decorate([
    (0, common_1.Post)('company'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createCompany", null);
__decorate([
    (0, common_1.Post)('school/:companyId'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createSchool", null);
__decorate([
    (0, common_1.Get)('companies'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllCompanies", null);
__decorate([
    (0, common_1.Get)('schools'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllSchools", null);
__decorate([
    (0, common_1.Get)('company/:companyId/schools'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCompanySchools", null);
__decorate([
    (0, common_1.Get)('company/:companyId/routes'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCompanyRoutes", null);
__decorate([
    (0, common_1.Get)('company/:companyId/children'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCompanyChildren", null);
__decorate([
    (0, common_1.Get)('company/:companyId/children/payments'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getChildrenPayments", null);
__decorate([
    (0, common_1.Get)('company/:companyId/drivers'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCompanyDrivers", null);
__decorate([
    (0, common_1.Post)('driver/:driverId/photo'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo')),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "uploadDriverPhoto", null);
__decorate([
    (0, common_1.Get)('companies/:companyId'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCompanyById", null);
__decorate([
    (0, common_1.Delete)('company/:companyId'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteCompany", null);
__decorate([
    (0, common_1.Put)('school/:schoolId'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('schoolId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSchool", null);
__decorate([
    (0, common_1.Delete)('school/:schoolId'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteSchool", null);
__decorate([
    (0, common_1.Get)('company/:companyId/analytics'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCompanyAnalytics", null);
__decorate([
    (0, common_1.Get)('company/:companyId/trips'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCompanyTrips", null);
__decorate([
    (0, common_1.Get)('company/:companyId/trips/active'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCompanyActiveTrips", null);
__decorate([
    (0, common_1.Get)('company/:companyId/reports/attendance'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAttendanceReport", null);
__decorate([
    (0, common_1.Get)('company/:companyId/reports/payments'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPaymentReport", null);
__decorate([
    (0, common_1.Get)('company/:companyId/reports/driver-performance'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDriverPerformanceReport", null);
__decorate([
    (0, common_1.Get)('company/:companyId/fare'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCompanyFare", null);
__decorate([
    (0, common_1.Patch)('company/:companyId/fare'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, fare_management_dto_1.UpdateFareDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCompanyFare", null);
__decorate([
    (0, common_1.Get)('company/:companyId/fare/history'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getFareHistory", null);
__decorate([
    (0, common_1.Get)('company/:companyId/payment-plans'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCompanyPaymentPlans", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map