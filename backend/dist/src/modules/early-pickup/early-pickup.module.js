"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EarlyPickupModule = void 0;
const common_1 = require("@nestjs/common");
const early_pickup_service_1 = require("./early-pickup.service");
const early_pickup_controller_1 = require("./early-pickup.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
const realtime_module_1 = require("../realtime/realtime.module");
let EarlyPickupModule = class EarlyPickupModule {
};
exports.EarlyPickupModule = EarlyPickupModule;
exports.EarlyPickupModule = EarlyPickupModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, realtime_module_1.RealtimeModule],
        controllers: [early_pickup_controller_1.EarlyPickupController],
        providers: [early_pickup_service_1.EarlyPickupRequestsService],
        exports: [early_pickup_service_1.EarlyPickupRequestsService],
    })
], EarlyPickupModule);
//# sourceMappingURL=early-pickup.module.js.map