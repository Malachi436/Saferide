import { PrismaService } from '../../prisma/prisma.service';
import { DayOfWeek, ScheduleStatus } from '@prisma/client';
export declare class ScheduledRoutesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        routeId: string;
        driverId: string;
        busId: string;
        scheduledTime: string;
        recurringDays: DayOfWeek[];
        effectiveFrom?: Date;
        effectiveUntil?: Date;
    }): Promise<{
        driver: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                email: string;
                phone: string | null;
                companyId: string | null;
                schoolId: string | null;
                passwordHash: string;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
            };
        } & {
            id: string;
            license: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        bus: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string | null;
            driverId: string | null;
            plateNumber: string;
            capacity: number;
        };
        route: {
            school: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                phone: string | null;
                companyId: string;
                latitude: number | null;
                longitude: number | null;
                schoolCode: string | null;
                address: string | null;
            };
            stops: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                routeId: string;
                latitude: number;
                longitude: number;
                order: number;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            busId: string | null;
            shift: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    }>;
    findAll(): Promise<({
        driver: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                email: string;
                phone: string | null;
                companyId: string | null;
                schoolId: string | null;
                passwordHash: string;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
            };
        } & {
            id: string;
            license: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        bus: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string | null;
            driverId: string | null;
            plateNumber: string;
            capacity: number;
        };
        route: {
            school: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                phone: string | null;
                companyId: string;
                latitude: number | null;
                longitude: number | null;
                schoolCode: string | null;
                address: string | null;
            };
            stops: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                routeId: string;
                latitude: number;
                longitude: number;
                order: number;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            busId: string | null;
            shift: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    })[]>;
    findByCompany(companyId: string): Promise<({
        driver: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                email: string;
                phone: string | null;
                companyId: string | null;
                schoolId: string | null;
                passwordHash: string;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
            };
        } & {
            id: string;
            license: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        bus: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string | null;
            driverId: string | null;
            plateNumber: string;
            capacity: number;
        };
        route: {
            school: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                phone: string | null;
                companyId: string;
                latitude: number | null;
                longitude: number | null;
                schoolCode: string | null;
                address: string | null;
            };
            stops: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                routeId: string;
                latitude: number;
                longitude: number;
                order: number;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            busId: string | null;
            shift: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        driver: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                email: string;
                phone: string | null;
                companyId: string | null;
                schoolId: string | null;
                passwordHash: string;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
            };
        } & {
            id: string;
            license: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        bus: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string | null;
            driverId: string | null;
            plateNumber: string;
            capacity: number;
        };
        route: {
            school: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                phone: string | null;
                companyId: string;
                latitude: number | null;
                longitude: number | null;
                schoolCode: string | null;
                address: string | null;
            };
            stops: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                routeId: string;
                latitude: number;
                longitude: number;
                order: number;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            busId: string | null;
            shift: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    }>;
    findActiveForDay(dayOfWeek: DayOfWeek): Promise<({
        driver: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                email: string;
                phone: string | null;
                companyId: string | null;
                schoolId: string | null;
                passwordHash: string;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
            };
        } & {
            id: string;
            license: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        bus: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string | null;
            driverId: string | null;
            plateNumber: string;
            capacity: number;
        };
        route: {
            school: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                phone: string | null;
                companyId: string;
                latitude: number | null;
                longitude: number | null;
                schoolCode: string | null;
                address: string | null;
            };
            stops: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                routeId: string;
                latitude: number;
                longitude: number;
                order: number;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            busId: string | null;
            shift: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    })[]>;
    update(id: string, data: Partial<{
        routeId: string;
        driverId: string;
        busId: string;
        scheduledTime: string;
        recurringDays: DayOfWeek[];
        status: ScheduleStatus;
        effectiveFrom: Date;
        effectiveUntil: Date;
    }>): Promise<{
        driver: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                email: string;
                phone: string | null;
                companyId: string | null;
                schoolId: string | null;
                passwordHash: string;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
            };
        } & {
            id: string;
            license: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        bus: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string | null;
            driverId: string | null;
            plateNumber: string;
            capacity: number;
        };
        route: {
            school: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                phone: string | null;
                companyId: string;
                latitude: number | null;
                longitude: number | null;
                schoolCode: string | null;
                address: string | null;
            };
            stops: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                routeId: string;
                latitude: number;
                longitude: number;
                order: number;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            busId: string | null;
            shift: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    }>;
    suspend(id: string): Promise<{
        driver: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                email: string;
                phone: string | null;
                companyId: string | null;
                schoolId: string | null;
                passwordHash: string;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
            };
        } & {
            id: string;
            license: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        bus: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string | null;
            driverId: string | null;
            plateNumber: string;
            capacity: number;
        };
        route: {
            school: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                phone: string | null;
                companyId: string;
                latitude: number | null;
                longitude: number | null;
                schoolCode: string | null;
                address: string | null;
            };
            stops: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                routeId: string;
                latitude: number;
                longitude: number;
                order: number;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            busId: string | null;
            shift: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    }>;
    activate(id: string): Promise<{
        driver: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                email: string;
                phone: string | null;
                companyId: string | null;
                schoolId: string | null;
                passwordHash: string;
                role: import(".prisma/client").$Enums.Role;
                refreshToken: string | null;
            };
        } & {
            id: string;
            license: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        bus: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string | null;
            driverId: string | null;
            plateNumber: string;
            capacity: number;
        };
        route: {
            school: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                phone: string | null;
                companyId: string;
                latitude: number | null;
                longitude: number | null;
                schoolCode: string | null;
                address: string | null;
            };
            stops: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                routeId: string;
                latitude: number;
                longitude: number;
                order: number;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            schoolId: string;
            busId: string | null;
            shift: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        busId: string;
        routeId: string;
        driverId: string;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        scheduledTime: string;
        recurringDays: import(".prisma/client").$Enums.DayOfWeek[];
        autoAssignChildren: boolean;
        effectiveFrom: Date | null;
        effectiveUntil: Date | null;
    }>;
}
