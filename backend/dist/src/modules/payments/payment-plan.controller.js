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
exports.PaymentPlanController = void 0;
const common_1 = require("@nestjs/common");
const payment_plan_service_1 = require("./payment-plan.service");
const roles_decorator_1 = require("../roles/roles.decorator");
const roles_guard_1 = require("../roles/roles.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PaymentPlanController = class PaymentPlanController {
    constructor(paymentPlanService) {
        this.paymentPlanService = paymentPlanService;
    }
    async getCompanyPaymentPlans(companyId) {
        return this.paymentPlanService.getPaymentPlans(companyId);
    }
    async createPaymentPlan(companyId, createPaymentPlanDto) {
        return this.paymentPlanService.createPaymentPlan(companyId, createPaymentPlanDto);
    }
    async updatePaymentPlan(id, updatePaymentPlanDto) {
        return this.paymentPlanService.updatePaymentPlan(id, updatePaymentPlanDto);
    }
    async deletePaymentPlan(id) {
        return this.paymentPlanService.deletePaymentPlan(id);
    }
};
exports.PaymentPlanController = PaymentPlanController;
__decorate([
    (0, common_1.Get)('company/:companyId'),
    (0, roles_decorator_1.Roles)('COMPANY_ADMIN', 'PLATFORM_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentPlanController.prototype, "getCompanyPaymentPlans", null);
__decorate([
    (0, common_1.Post)('company/:companyId'),
    (0, roles_decorator_1.Roles)('COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentPlanController.prototype, "createPaymentPlan", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentPlanController.prototype, "updatePaymentPlan", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('COMPANY_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentPlanController.prototype, "deletePaymentPlan", null);
exports.PaymentPlanController = PaymentPlanController = __decorate([
    (0, common_1.Controller)('payment-plans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [payment_plan_service_1.PaymentPlanService])
], PaymentPlanController);
//# sourceMappingURL=payment-plan.controller.js.map