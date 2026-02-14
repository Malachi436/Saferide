import { AttendanceService } from './attendance.service';
import { AttendanceStatus } from '@prisma/client';
declare class RecordAttendanceDto {
    childId: string;
    tripId: string;
    status: AttendanceStatus;
    recordedBy: string;
}
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    recordAttendance(recordAttendanceDto: RecordAttendanceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        timestamp: Date;
        recordedBy: string;
        childId: string;
        tripId: string;
    }>;
    updateAttendance(id: string, updateDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        timestamp: Date;
        recordedBy: string;
        childId: string;
        tripId: string;
    }>;
    getAttendanceByChild(childId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        timestamp: Date;
        recordedBy: string;
        childId: string;
        tripId: string;
    }[]>;
    getAttendanceByTrip(tripId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        timestamp: Date;
        recordedBy: string;
        childId: string;
        tripId: string;
    }[]>;
    getAttendanceById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        timestamp: Date;
        recordedBy: string;
        childId: string;
        tripId: string;
    }>;
    verifyTripAttendance(tripId: string): Promise<{
        totalExpected: number;
        totalAccounted: number;
        missing: Array<{
            childId: string;
            childName: string;
            expectedStatus: string;
        }>;
        allAccounted: boolean;
    }>;
    checkChildrenLeftOnBus(tripId: string): Promise<{
        childrenLeftOnBus: Array<{
            childId: string;
            childName: string;
            parentContact: string | null;
        }>;
        alertTriggered: boolean;
    }>;
}
export {};
