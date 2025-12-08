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
}
export {};
