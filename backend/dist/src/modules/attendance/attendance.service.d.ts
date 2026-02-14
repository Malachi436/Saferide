import { PrismaService } from '../../prisma/prisma.service';
import { ChildAttendance, AttendanceStatus } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export declare class AttendanceService {
    private prisma;
    private realtimeGateway?;
    constructor(prisma: PrismaService, realtimeGateway?: RealtimeGateway);
    private getStatusText;
    recordAttendance(childId: string, tripId: string, status: AttendanceStatus, recordedBy: string): Promise<ChildAttendance>;
    updateAttendance(id: string, status: AttendanceStatus, recordedBy: string): Promise<ChildAttendance>;
    getAttendanceByChild(childId: string): Promise<ChildAttendance[]>;
    getAttendanceByTrip(tripId: string): Promise<ChildAttendance[]>;
    getAttendanceById(id: string): Promise<ChildAttendance | null>;
    markChildAsMissed(childId: string, tripId: string, recordedBy: string): Promise<ChildAttendance>;
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
    checkForChildrenLeftOnBus(tripId: string): Promise<{
        childrenLeftOnBus: Array<{
            childId: string;
            childName: string;
            parentContact: string | null;
        }>;
        alertTriggered: boolean;
    }>;
}
