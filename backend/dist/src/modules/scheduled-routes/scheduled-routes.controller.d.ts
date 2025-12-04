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
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                companyId: string | null;
                passwordHash: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
                schoolId: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            capacity: number;
            driverId: string;
        };
        route: {
            school: {
                id: string;
                name: string;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                latitude: number | null;
                longitude: number | null;
                companyId: string;
            };
            stops: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                latitude: number;
                longitude: number;
                order: number;
                routeId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
        busId: string;
    }>;
    findAll(): Promise<({
        driver: {
            user: {
                id: string;
                email: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                companyId: string | null;
                passwordHash: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
                schoolId: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            capacity: number;
            driverId: string;
        };
        route: {
            school: {
                id: string;
                name: string;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                latitude: number | null;
                longitude: number | null;
                companyId: string;
            };
            stops: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                latitude: number;
                longitude: number;
                order: number;
                routeId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
        busId: string;
    })[]>;
    findToday(): Promise<({
        driver: {
            user: {
                id: string;
                email: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                companyId: string | null;
                passwordHash: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
                schoolId: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            capacity: number;
            driverId: string;
        };
        route: {
            school: {
                id: string;
                name: string;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                latitude: number | null;
                longitude: number | null;
                companyId: string;
            };
            stops: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                latitude: number;
                longitude: number;
                order: number;
                routeId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
        busId: string;
    })[]>;
    findOne(id: string): Promise<{
        driver: {
            user: {
                id: string;
                email: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                companyId: string | null;
                passwordHash: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
                schoolId: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            capacity: number;
            driverId: string;
        };
        route: {
            school: {
                id: string;
                name: string;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                latitude: number | null;
                longitude: number | null;
                companyId: string;
            };
            stops: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                latitude: number;
                longitude: number;
                order: number;
                routeId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
        busId: string;
    }>;
    update(id: string, data: any): Promise<{
        driver: {
            user: {
                id: string;
                email: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                companyId: string | null;
                passwordHash: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
                schoolId: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            capacity: number;
            driverId: string;
        };
        route: {
            school: {
                id: string;
                name: string;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                latitude: number | null;
                longitude: number | null;
                companyId: string;
            };
            stops: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                latitude: number;
                longitude: number;
                order: number;
                routeId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
        busId: string;
    }>;
    suspend(id: string): Promise<{
        driver: {
            user: {
                id: string;
                email: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                companyId: string | null;
                passwordHash: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
                schoolId: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            capacity: number;
            driverId: string;
        };
        route: {
            school: {
                id: string;
                name: string;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                latitude: number | null;
                longitude: number | null;
                companyId: string;
            };
            stops: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                latitude: number;
                longitude: number;
                order: number;
                routeId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
        busId: string;
    }>;
    activate(id: string): Promise<{
        driver: {
            user: {
                id: string;
                email: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                companyId: string | null;
                passwordHash: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
                schoolId: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            capacity: number;
            driverId: string;
        };
        route: {
            school: {
                id: string;
                name: string;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                latitude: number | null;
                longitude: number | null;
                companyId: string;
            };
            stops: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                latitude: number;
                longitude: number;
                order: number;
                routeId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
        busId: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        routeId: string;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        status: import(".prisma/client").$Enums.ScheduleStatus;
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
        busId: string;
    }>;
}
