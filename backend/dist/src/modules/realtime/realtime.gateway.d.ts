import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private readonly redis;
    private readonly connectedUsers;
    constructor(jwtService: JwtService);
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
    emitLocationUpdate(busId: string, locationData: any): Promise<void>;
    emitNewNotification(userId: string, notification: any): Promise<void>;
}
