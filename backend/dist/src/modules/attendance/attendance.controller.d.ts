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
        timestamp: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        childId: string;
        tripId: string;
        recordedBy: string;
    }>;
    updateAttendance(id: string, updateDto: any): Promise<{
        timestamp: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        childId: string;
        tripId: string;
        recordedBy: string;
    }>;
    getAttendanceByChild(childId: string): Promise<{
        timestamp: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        childId: string;
        tripId: string;
        recordedBy: string;
    }[]>;
    getAttendanceByTrip(tripId: string): Promise<{
        timestamp: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        childId: string;
        tripId: string;
        recordedBy: string;
    }[]>;
    getAttendanceById(id: string): Promise<{
        timestamp: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        childId: string;
        tripId: string;
        recordedBy: string;
    }>;
}
export {};
