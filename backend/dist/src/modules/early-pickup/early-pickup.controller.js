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
exports.EarlyPickupController = void 0;
const common_1 = require("@nestjs/common");
const early_pickup_service_1 = require("./early-pickup.service");
const roles_decorator_1 = require("../roles/roles.decorator");
const roles_guard_1 = require("../roles/roles.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let EarlyPickupController = class EarlyPickupController {
    constructor(earlyPickupService) {
        this.earlyPickupService = earlyPickupService;
    }
    async requestEarlyPickup(data, req) {
        const parentId = req.user.sub;
        return this.earlyPickupService.requestEarlyPickup(data.childId, data.tripId, parentId, data.reason, data.timeOfDay);
    }
    async approveRequest(requestId, req) {
        const approvedBy = req.user.sub;
        return this.earlyPickupService.approveEarlyPickup(requestId, approvedBy);
    }
    async rejectRequest(requestId, data) {
        return this.earlyPickupService.rejectEarlyPickup(requestId, data.reason);
    }
    async cancelRequest(requestId) {
        return this.earlyPickupService.cancelRequest(requestId);
    }
    async getPendingRequests(tripId) {
        return this.earlyPickupService.getPendingRequestsForTrip(tripId);
    }
    async getApprovedRequests(tripId) {
        return this.earlyPickupService.getApprovedRequestsForTrip(tripId);
    }
    async getParentRequests(parentId) {
        return this.earlyPickupService.getParentRequests(parentId);
    }
};
exports.EarlyPickupController = EarlyPickupController;
__decorate([
    (0, common_1.Post)('request'),
    (0, roles_decorator_1.Roles)('PARENT'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EarlyPickupController.prototype, "requestEarlyPickup", null);
__decorate([
    (0, common_1.Put)(':requestId/approve'),
    (0, roles_decorator_1.Roles)('DRIVER', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EarlyPickupController.prototype, "approveRequest", null);
__decorate([
    (0, common_1.Put)(':requestId/reject'),
    (0, roles_decorator_1.Roles)('DRIVER', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EarlyPickupController.prototype, "rejectRequest", null);
__decorate([
    (0, common_1.Put)(':requestId/cancel'),
    (0, roles_decorator_1.Roles)('PARENT'),
    __param(0, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EarlyPickupController.prototype, "cancelRequest", null);
__decorate([
    (0, common_1.Get)('trip/:tripId/pending'),
    (0, roles_decorator_1.Roles)('DRIVER', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EarlyPickupController.prototype, "getPendingRequests", null);
__decorate([
    (0, common_1.Get)('trip/:tripId/approved'),
    (0, roles_decorator_1.Roles)('DRIVER', 'COMPANY_ADMIN', 'PARENT'),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EarlyPickupController.prototype, "getApprovedRequests", null);
__decorate([
    (0, common_1.Get)('parent/:parentId'),
    (0, roles_decorator_1.Roles)('PARENT', 'COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('parentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EarlyPickupController.prototype, "getParentRequests", null);
exports.EarlyPickupController = EarlyPickupController = __decorate([
    (0, common_1.Controller)('early-pickup'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [early_pickup_service_1.EarlyPickupRequestsService])
], EarlyPickupController);
//# sourceMappingURL=early-pickup.controller.js.map