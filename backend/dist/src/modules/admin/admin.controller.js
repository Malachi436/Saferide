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
const admin_service_1 = require("./admin.service");
const roles_decorator_1 = require("../roles/roles.decorator");
const roles_guard_1 = require("../roles/roles.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getPlatformStats() {
        return this.adminService.getPlatformStats();
    }
    async getCompanyStats(companyId) {
        return this.adminService.getCompanyStats(companyId);
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
    async getCompanyById(companyId) {
        return this.adminService.getCompanyById(companyId);
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
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
    (0, common_1.Get)('companies/:companyId'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCompanyById", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map