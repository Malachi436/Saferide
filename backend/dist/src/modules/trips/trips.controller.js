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
exports.TripsController = void 0;
const common_1 = require("@nestjs/common");
const trips_service_1 = require("./trips.service");
const trip_automation_service_1 = require("./trip-automation.service");
const roles_decorator_1 = require("../roles/roles.decorator");
const roles_guard_1 = require("../roles/roles.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const prisma_service_1 = require("../../prisma/prisma.service");
let TripsController = class TripsController {
    constructor(tripsService, tripAutomationService, prisma) {
        this.tripsService = tripsService;
        this.tripAutomationService = tripAutomationService;
        this.prisma = prisma;
    }
    create(createTripDto) {
        return this.tripsService.create(createTripDto);
    }
    findAll() {
        return this.tripsService.findAll();
    }
    findOne(id) {
        return this.tripsService.findOne(id);
    }
    async findActiveByChild(childId, req) {
        if (req.user.role === 'PARENT') {
            const child = await this.prisma.child.findUnique({
                where: { id: childId },
                select: { parentId: true },
            });
            if (!child) {
                throw new common_1.NotFoundException('Child not found');
            }
            if (child.parentId !== req.user.userId) {
                throw new common_1.ForbiddenException('Access denied: Not your child');
            }
        }
        return this.tripsService.findActiveByChildId(childId);
    }
    findActiveByCompany(companyId) {
        return this.tripsService.findActiveByCompanyId(companyId);
    }
    update(id, updateTripDto) {
        return this.tripsService.update(id, updateTripDto);
    }
    transitionStatus(id, statusDto) {
        return this.tripsService.transitionTripStatus(id, statusDto.status, statusDto.userId);
    }
    remove(id) {
        return this.tripsService.remove(id);
    }
    async generateTodayTrips() {
        return await this.tripAutomationService.generateTripsManually();
    }
};
exports.TripsController = TripsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('child/:childId'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT'),
    __param(0, (0, common_1.Param)('childId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "findActiveByChild", null);
__decorate([
    (0, common_1.Get)('company/:companyId/active'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "findActiveByCompany", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "transitionStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('generate-today'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "generateTodayTrips", null);
exports.TripsController = TripsController = __decorate([
    (0, common_1.Controller)('trips'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [trips_service_1.TripsService,
        trip_automation_service_1.TripAutomationService,
        prisma_service_1.PrismaService])
], TripsController);
//# sourceMappingURL=trips.controller.js.map