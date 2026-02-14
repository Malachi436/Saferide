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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (user.role === 'PLATFORM_ADMIN')
            return true;
        if (user.role === 'SCHOOL_ADMIN') {
            const request = context.switchToHttp().getRequest();
            let schoolId = request.params.schoolId || request.body?.schoolId || request.query?.schoolId;
            if (schoolId === 'undefined' || schoolId === undefined || schoolId === null || schoolId === '') {
                console.log('[RolesGuard] No schoolId in request, allowing access for data filtering');
                return true;
            }
            console.log('[RolesGuard] SCHOOL_ADMIN - user.schoolId:', user.schoolId, 'request schoolId:', schoolId);
            if (user.schoolId !== schoolId) {
                console.log('[RolesGuard] Access denied - schoolId mismatch');
                throw new common_1.ForbiddenException('Access denied: School admin can only access their own school data');
            }
            if (!user.schoolId) {
                console.log('[RolesGuard] Access denied - user has no schoolId');
                throw new common_1.ForbiddenException('Access denied: School admin must be assigned to a school');
            }
            if (requiredRoles.includes('SCHOOL_ADMIN')) {
                return true;
            }
        }
        return requiredRoles.some((role) => user.role === role);
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map