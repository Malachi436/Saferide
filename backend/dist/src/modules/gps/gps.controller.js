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
exports.GpsController = void 0;
const common_1 = require("@nestjs/common");
const gps_service_1 = require("./gps.service");
const roles_decorator_1 = require("../roles/roles.decorator");
const roles_guard_1 = require("../roles/roles.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
class HeartbeatDto {
}
let GpsController = class GpsController {
    constructor(gpsService) {
        this.gpsService = gpsService;
    }
    async processHeartbeat(heartbeatDto) {
        return this.gpsService.processHeartbeat(heartbeatDto.busId, heartbeatDto.latitude, heartbeatDto.longitude, heartbeatDto.speed, new Date(heartbeatDto.timestamp));
    }
    async getCurrentLocation(busId) {
        return this.gpsService.getCurrentLocation(busId);
    }
    async getRecentLocations(busId, startTime, endTime, limit) {
        return this.gpsService.getLocationHistory(busId, startTime ? new Date(startTime) : undefined, endTime ? new Date(endTime) : undefined, limit ? parseInt(limit) : 100);
    }
};
exports.GpsController = GpsController;
__decorate([
    (0, common_1.Post)('heartbeat'),
    (0, roles_decorator_1.Roles)('DRIVER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [HeartbeatDto]),
    __metadata("design:returntype", Promise)
], GpsController.prototype, "processHeartbeat", null);
__decorate([
    (0, common_1.Get)('location/:busId'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER', 'PARENT'),
    __param(0, (0, common_1.Param)('busId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GpsController.prototype, "getCurrentLocation", null);
__decorate([
    (0, common_1.Get)('locations/:busId'),
    (0, roles_decorator_1.Roles)('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER'),
    __param(0, (0, common_1.Param)('busId')),
    __param(1, (0, common_1.Query)('startTime')),
    __param(2, (0, common_1.Query)('endTime')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], GpsController.prototype, "getRecentLocations", null);
exports.GpsController = GpsController = __decorate([
    (0, common_1.Controller)('gps'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [gps_service_1.GpsService])
], GpsController);
//# sourceMappingURL=gps.controller.js.map