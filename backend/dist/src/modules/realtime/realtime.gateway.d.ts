import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private prisma;
    server: Server;
    private readonly redis;
    private readonly redisSub;
    private readonly connectedUsers;
    private readonly gpsHeartbeatCounter;
    private readonly HEARTBEAT_THRESHOLD;
    constructor(jwtService: JwtService, prisma: PrismaService);
    private initializeRedisSubscriber;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    private joinUserRooms;
    private getRelevantBuses;
    private broadcastLocationUpdate;
    handleJoinBusRoom(client: Socket, data: {
        busId: string;
    }): Promise<{
        success: boolean;
    }>;
    handleLeaveBusRoom(client: Socket, data: {
        busId: string;
    }): Promise<{
        success: boolean;
    }>;
    handleGpsUpdate(client: Socket, data: {
        busId: string;
        latitude: number;
        longitude: number;
        speed?: number;
        heading?: number;
        accuracy?: number;
        timestamp?: string;
    }): Promise<{
        success: boolean;
    }>;
    handleJoinCompanyRoom(client: Socket, data: {
        companyId: string;
    }): Promise<{
        success: boolean;
    }>;
    handleJoinSchoolRoom(client: Socket, data: {
        schoolId: string;
    }): Promise<{
        success: boolean;
    }>;
    handleSubscribeTripTracking(client: Socket, data: {
        tripId: string;
    }): Promise<{
        success: boolean;
    }>;
    handleUnsubscribeTripTracking(client: Socket, data: {
        tripId: string;
    }): Promise<{
        success: boolean;
    }>;
    emitLocationUpdate(busId: string, locationData: any): Promise<void>;
    emitNewNotification(userId: string, notification: any): Promise<void>;
}
