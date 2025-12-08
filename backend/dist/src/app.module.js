"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const nest_winston_1 = require("nest-winston");
const winston = __importStar(require("winston"));
const auth_module_1 = require("./modules/auth/auth.module");
const roles_module_1 = require("./modules/roles/roles.module");
const tenancy_module_1 = require("./modules/tenancy/tenancy.module");
const users_module_1 = require("./modules/users/users.module");
const drivers_module_1 = require("./modules/drivers/drivers.module");
const children_module_1 = require("./modules/children/children.module");
const buses_module_1 = require("./modules/buses/buses.module");
const routes_module_1 = require("./modules/routes/routes.module");
const trips_module_1 = require("./modules/trips/trips.module");
const gps_module_1 = require("./modules/gps/gps.module");
const attendance_module_1 = require("./modules/attendance/attendance.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const payments_module_1 = require("./modules/payments/payments.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const admin_module_1 = require("./modules/admin/admin.module");
const realtime_module_1 = require("./modules/realtime/realtime.module");
const trip_exceptions_module_1 = require("./modules/trip-exceptions/trip-exceptions.module");
const early_pickup_module_1 = require("./modules/early-pickup/early-pickup.module");
const scheduled_routes_module_1 = require("./modules/scheduled-routes/scheduled-routes.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            nest_winston_1.WinstonModule.forRoot({
                transports: [
                    new winston.transports.Console({
                        format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.printf(({ timestamp, level, message }) => {
                            return `[${timestamp}] ${level}: ${message}`;
                        })),
                    }),
                ],
            }),
            auth_module_1.AuthModule,
            roles_module_1.RolesModule,
            tenancy_module_1.TenancyModule,
            users_module_1.UsersModule,
            drivers_module_1.DriversModule,
            children_module_1.ChildrenModule,
            buses_module_1.BusesModule,
            routes_module_1.RoutesModule,
            trips_module_1.TripsModule,
            gps_module_1.GpsModule,
            attendance_module_1.AttendanceModule,
            notifications_module_1.NotificationsModule,
            payments_module_1.PaymentsModule,
            analytics_module_1.AnalyticsModule,
            admin_module_1.AdminModule,
            realtime_module_1.RealtimeModule,
            trip_exceptions_module_1.TripExceptionsModule,
            early_pickup_module_1.EarlyPickupModule,
            scheduled_routes_module_1.ScheduledRoutesModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map