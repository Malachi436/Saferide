import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BusLocation } from '@prisma/client';
import { Redis } from 'ioredis';

@Injectable()
export class GpsService {
  private readonly redis: Redis;
  private readonly HEARTBEAT_THRESHOLD = 5; // Save to DB every 5 heartbeats

  constructor(private prisma: PrismaService) {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async processHeartbeat(busId: string, latitude: number, longitude: number, speed: number, timestamp: Date): Promise<BusLocation> {
    // Validate inputs
    if (!busId || !latitude || !longitude || !timestamp) {
      throw new Error('Missing required GPS data');
    }

    // Store in Redis for real-time access
    const locationData = {
      busId,
      latitude,
      longitude,
      speed,
      timestamp: timestamp.toISOString(),
    };

    await this.redis.setex(`bus:${busId}:location`, 300, JSON.stringify(locationData)); // Expire in 5 minutes

    // Increment heartbeat counter
    const heartbeatCount = await this.redis.incr(`bus:${busId}:heartbeat_count`);
    
    // Save to database every N heartbeats
    if (heartbeatCount % this.HEARTBEAT_THRESHOLD === 0) {
      return this.prisma.busLocation.create({
        data: {
          busId,
          latitude,
          longitude,
          speed,
          timestamp,
        },
      });
    }

    // Return a minimal response for non-snapshot heartbeats
    return {
      id: '',
      busId,
      latitude,
      longitude,
      speed,
      timestamp,
      createdAt: new Date(),
    } as BusLocation;
  }

  async getCurrentLocation(busId: string): Promise<any> {
    const location = await this.redis.get(`bus:${busId}:location`);
    return location ? JSON.parse(location) : null;
  }

  async getRecentLocations(busId: string, limit: number = 10): Promise<BusLocation[]> {
    return this.prisma.busLocation.findMany({
      where: { busId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getLocationHistory(
    busId: string,
    startTime?: Date,
    endTime?: Date,
    limit: number = 100,
  ): Promise<BusLocation[]> {
    return this.prisma.busLocation.findMany({
      where: {
        busId,
        ...(startTime || endTime
          ? {
              timestamp: {
                ...(startTime && { gte: startTime }),
                ...(endTime && { lte: endTime }),
              },
            }
          : {}),
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}