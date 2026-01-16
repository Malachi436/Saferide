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
            companyId: string | null;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                name: string;
                email: string | null;
                phone: string | null;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                schoolCode: string | null;
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
            companyId: string | null;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                name: string;
                email: string | null;
                phone: string | null;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                schoolCode: string | null;
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
    findByCompany(companyId: string): Promise<({
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
            companyId: string | null;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                name: string;
                email: string | null;
                phone: string | null;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                schoolCode: string | null;
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
            companyId: string | null;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                name: string;
                email: string | null;
                phone: string | null;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                schoolCode: string | null;
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
    findActiveForDay(dayOfWeek: DayOfWeek): Promise<({
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
            companyId: string | null;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                name: string;
                email: string | null;
                phone: string | null;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                schoolCode: string | null;
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
            companyId: string | null;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                name: string;
                email: string | null;
                phone: string | null;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                schoolCode: string | null;
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
            companyId: string | null;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                name: string;
                email: string | null;
                phone: string | null;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                schoolCode: string | null;
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
            companyId: string | null;
            plateNumber: string;
            capacity: number;
            driverId: string | null;
        };
        route: {
            school: {
                id: string;
                name: string;
                email: string | null;
                phone: string | null;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                schoolCode: string | null;
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
}
