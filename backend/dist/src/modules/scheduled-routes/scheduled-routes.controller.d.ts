import { ScheduledRoutesService } from './scheduled-routes.service';
import { DayOfWeek } from '@prisma/client';
export declare class ScheduledRoutesController {
    private readonly scheduledRoutesService;
    constructor(scheduledRoutesService: ScheduledRoutesService);
    create(data: {
        routeId: string;
        driverId: string;
        busId: string;
        scheduledTime: string;
        recurringDays: DayOfWeek[];
        effectiveFrom?: string;
        effectiveUntil?: string;
    }): Promise<{
        driver: {
            user: {
                id: string;
                email: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
                schoolId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            license: string;
            userId: string;
        };
        bus: {
            id: string;
            schoolId: string | null;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                email: string | null;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                schoolCode: string | null;
                baseFare: number;
                currency: string;
                latitude: number | null;
                longitude: number | null;
                address: string | null;
            };
            stops: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                latitude: number;
                longitude: number;
                order: number;
                routeId: string;
            }[];
        } & {
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            shift: string | null;
            busId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        busId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    }>;
    findAll(): Promise<({
        driver: {
            user: {
                id: string;
                email: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
                schoolId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            license: string;
            userId: string;
        };
        bus: {
            id: string;
            schoolId: string | null;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                email: string | null;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                schoolCode: string | null;
                baseFare: number;
                currency: string;
                latitude: number | null;
                longitude: number | null;
                address: string | null;
            };
            stops: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                latitude: number;
                longitude: number;
                order: number;
                routeId: string;
            }[];
        } & {
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            shift: string | null;
            busId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        busId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    })[]>;
    findBySchool(schoolId: string): Promise<({
        driver: {
            user: {
                id: string;
                email: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
                schoolId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            license: string;
            userId: string;
        };
        bus: {
            id: string;
            schoolId: string | null;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                email: string | null;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                schoolCode: string | null;
                baseFare: number;
                currency: string;
                latitude: number | null;
                longitude: number | null;
                address: string | null;
            };
            stops: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                latitude: number;
                longitude: number;
                order: number;
                routeId: string;
            }[];
        } & {
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            shift: string | null;
            busId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        busId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    })[]>;
    findToday(): Promise<({
        driver: {
            user: {
                id: string;
                email: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
                schoolId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            license: string;
            userId: string;
        };
        bus: {
            id: string;
            schoolId: string | null;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                email: string | null;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                schoolCode: string | null;
                baseFare: number;
                currency: string;
                latitude: number | null;
                longitude: number | null;
                address: string | null;
            };
            stops: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                latitude: number;
                longitude: number;
                order: number;
                routeId: string;
            }[];
        } & {
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            shift: string | null;
            busId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        busId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        driver: {
            user: {
                id: string;
                email: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
                schoolId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            license: string;
            userId: string;
        };
        bus: {
            id: string;
            schoolId: string | null;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                email: string | null;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                schoolCode: string | null;
                baseFare: number;
                currency: string;
                latitude: number | null;
                longitude: number | null;
                address: string | null;
            };
            stops: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                latitude: number;
                longitude: number;
                order: number;
                routeId: string;
            }[];
        } & {
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            shift: string | null;
            busId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        busId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    }>;
    update(id: string, data: any): Promise<{
        driver: {
            user: {
                id: string;
                email: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
                schoolId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            license: string;
            userId: string;
        };
        bus: {
            id: string;
            schoolId: string | null;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                email: string | null;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                schoolCode: string | null;
                baseFare: number;
                currency: string;
                latitude: number | null;
                longitude: number | null;
                address: string | null;
            };
            stops: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                latitude: number;
                longitude: number;
                order: number;
                routeId: string;
            }[];
        } & {
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            shift: string | null;
            busId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        busId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    }>;
    suspend(id: string): Promise<{
        driver: {
            user: {
                id: string;
                email: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
                schoolId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            license: string;
            userId: string;
        };
        bus: {
            id: string;
            schoolId: string | null;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                email: string | null;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                schoolCode: string | null;
                baseFare: number;
                currency: string;
                latitude: number | null;
                longitude: number | null;
                address: string | null;
            };
            stops: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                latitude: number;
                longitude: number;
                order: number;
                routeId: string;
            }[];
        } & {
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            shift: string | null;
            busId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        busId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    }>;
    activate(id: string): Promise<{
        driver: {
            user: {
                id: string;
                email: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
                schoolId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            license: string;
            userId: string;
        };
        bus: {
            id: string;
            schoolId: string | null;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                email: string | null;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                schoolCode: string | null;
                baseFare: number;
                currency: string;
                latitude: number | null;
                longitude: number | null;
                address: string | null;
            };
            stops: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                latitude: number;
                longitude: number;
                order: number;
                routeId: string;
            }[];
        } & {
            id: string;
            schoolId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            shift: string | null;
            busId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        busId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        busId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    }>;
}
