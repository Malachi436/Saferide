import { PrismaService } from '../../prisma/prisma.service';
import { ChildAttendance, AttendanceStatus } from '@prisma/client';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    recordAttendance(childId: string, tripId: string, status: AttendanceStatus, recordedBy: string): Promise<ChildAttendance>;
    updateAttendance(id: string, status: AttendanceStatus, recordedBy: string): Promise<ChildAttendance>;
    getAttendanceByChild(childId: string): Promise<ChildAttendance[]>;
    getAttendanceByTrip(tripId: string): Promise<ChildAttendance[]>;
    getAttendanceById(id: string): Promise<ChildAttendance | null>;
    markChildAsMissed(childId: string, tripId: string, recordedBy: string): Promise<ChildAttendance>;
}
