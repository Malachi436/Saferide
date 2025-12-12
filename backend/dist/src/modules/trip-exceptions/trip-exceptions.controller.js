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
exports.TripExceptionsController = void 0;
const common_1 = require("@nestjs/common");
const trip_exceptions_service_1 = require("./trip-exceptions.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TripExceptionsController = class TripExceptionsController {
    constructor(tripExceptionsService) {
        this.tripExceptionsService = tripExceptionsService;
    }
    async skipTrip(body, req) {
        return this.tripExceptionsService.skipTrip(body.childId, body.tripId, body.reason);
    }
    async cancelSkip(childId, tripId) {
        return this.tripExceptionsService.cancelSkipTrip(childId, tripId);
    }
    async getTripExceptions(tripId) {
        return this.tripExceptionsService.getTripExceptions(tripId);
    }
    async getChildExceptions(childId) {
        return this.tripExceptionsService.getChildExceptions(childId);
    }
    async unskipTrip(body, req) {
        const parentId = req.user.userId;
        return this.tripExceptionsService.unskipTrip(body.childId, body.tripId, parentId, body.reason);
    }
};
exports.TripExceptionsController = TripExceptionsController;
__decorate([
    (0, common_1.Post)('/skip'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TripExceptionsController.prototype, "skipTrip", null);
__decorate([
    (0, common_1.Delete)('/:childId/:tripId'),
    __param(0, (0, common_1.Param)('childId')),
    __param(1, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TripExceptionsController.prototype, "cancelSkip", null);
__decorate([
    (0, common_1.Get)('/trip/:tripId'),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TripExceptionsController.prototype, "getTripExceptions", null);
__decorate([
    (0, common_1.Get)('/child/:childId'),
    __param(0, (0, common_1.Param)('childId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TripExceptionsController.prototype, "getChildExceptions", null);
__decorate([
    (0, common_1.Post)('/unskip'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TripExceptionsController.prototype, "unskipTrip", null);
exports.TripExceptionsController = TripExceptionsController = __decorate([
    (0, common_1.Controller)('trip-exceptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [trip_exceptions_service_1.TripExceptionsService])
], TripExceptionsController);
//# sourceMappingURL=trip-exceptions.controller.js.map