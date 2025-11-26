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
exports.TenancyMiddleware = void 0;
const common_1 = require("@nestjs/common");
const tenancy_service_1 = require("./tenancy.service");
let TenancyMiddleware = class TenancyMiddleware {
    constructor(tenancyService) {
        this.tenancyService = tenancyService;
    }
    use(req, res, next) {
        const user = req.user;
        if (user) {
            const companyId = this.tenancyService.extractCompanyIdFromJwtPayload(user);
            const schoolId = this.tenancyService.extractSchoolIdFromJwtPayload(user);
            req.companyId = companyId;
            req.schoolId = schoolId;
        }
        next();
    }
};
exports.TenancyMiddleware = TenancyMiddleware;
exports.TenancyMiddleware = TenancyMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenancy_service_1.TenancyService])
], TenancyMiddleware);
//# sourceMappingURL=tenancy.middleware.js.map