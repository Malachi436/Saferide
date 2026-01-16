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
        childId: string;
        tripId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        timestamp: Date;
        recordedBy: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateAttendance(id: string, updateDto: any): Promise<{
        id: string;
        childId: string;
        tripId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        timestamp: Date;
        recordedBy: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAttendanceByChild(childId: string): Promise<{
        id: string;
        childId: string;
        tripId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        timestamp: Date;
        recordedBy: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getAttendanceByTrip(tripId: string): Promise<{
        id: string;
        childId: string;
        tripId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        timestamp: Date;
        recordedBy: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getAttendanceById(id: string): Promise<{
        id: string;
        childId: string;
        tripId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        timestamp: Date;
        recordedBy: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
