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
exports.ChildrenController = void 0;
const common_1 = require("@nestjs/common");
const children_service_1 = require("./children.service");
const roles_decorator_1 = require("../roles/roles.decorator");
const roles_guard_1 = require("../roles/roles.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const prisma_service_1 = require("../../prisma/prisma.service");
const link_child_dto_1 = require("./dto/link-child.dto");
const location_change_dto_1 = require("./dto/location-change.dto");
let ChildrenController = class ChildrenController {
    constructor(childrenService, prisma) {
        this.childrenService = childrenService;
        this.prisma = prisma;
    }
    create(createChildDto) {
        return this.childrenService.create(createChildDto);
    }
    findAll() {
        return this.childrenService.findAll();
    }
    findOne(id) {
        return this.childrenService.findOne(id);
    }
    findByParent(parentId) {
        return this.childrenService.findByParentId(parentId);
    }
    update(id, updateChildDto) {
        return this.childrenService.update(id, updateChildDto);
    }
    remove(id) {
        return this.childrenService.remove(id);
    }
    async getSchools() {
        return this.prisma.school.findMany({
            select: {
                id: true,
                name: true,
                address: true,
                latitude: true,
                longitude: true,
            },
        });
    }
    linkChild(req, linkDto) {
        const parentId = req.user.userId;
        return this.childrenService.linkChildToParent(parentId, linkDto);
    }
    async generateCode() {
        const code = await this.childrenService.generateUniqueCode();
        return { uniqueCode: code };
    }
    bulkUpdateGrades(companyId, updateDto, req) {
        const adminId = req.user.userId;
        return this.childrenService.bulkUpdateGrades(companyId, updateDto, adminId);
    }
    requestLocationChange(req, requestDto) {
        const parentId = req.user.userId;
        return this.childrenService.requestLocationChange(parentId, requestDto);
    }
    getPendingLocationChangeRequests(companyId) {
        return this.childrenService.getPendingLocationChangeRequests(companyId);
    }
    reviewLocationChangeRequest(requestId, reviewDto, req) {
        const adminId = req.user.userId;
        return this.childrenService.reviewLocationChangeRequest(requestId, adminId, reviewDto);
    }
};
exports.ChildrenController = ChildrenController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('parent/:parentId'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT'),
    __param(0, (0, common_1.Param)('parentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "findByParent", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('public/schools'),
    (0, roles_decorator_1.Roles)('PARENT', 'PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChildrenController.prototype, "getSchools", null);
__decorate([
    (0, common_1.Post)('link'),
    (0, roles_decorator_1.Roles)('PARENT'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, link_child_dto_1.LinkChildDto]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "linkChild", null);
__decorate([
    (0, common_1.Post)('generate-code'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChildrenController.prototype, "generateCode", null);
__decorate([
    (0, common_1.Post)('company/:companyId/bulk-update-grades'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, link_child_dto_1.BulkUpdateGradesDto, Object]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "bulkUpdateGrades", null);
__decorate([
    (0, common_1.Post)('location-change/request'),
    (0, roles_decorator_1.Roles)('PARENT'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, location_change_dto_1.RequestLocationChangeDto]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "requestLocationChange", null);
__decorate([
    (0, common_1.Get)('company/:companyId/location-change/pending'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "getPendingLocationChangeRequests", null);
__decorate([
    (0, common_1.Patch)('location-change/:requestId/review'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, location_change_dto_1.ReviewLocationChangeDto, Object]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "reviewLocationChangeRequest", null);
exports.ChildrenController = ChildrenController = __decorate([
    (0, common_1.Controller)('children'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [children_service_1.ChildrenService, prisma_service_1.PrismaService])
], ChildrenController);
//# sourceMappingURL=children.controller.js.map