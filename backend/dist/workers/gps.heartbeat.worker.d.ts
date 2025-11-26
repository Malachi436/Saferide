import { Job } from 'bullmq';
export declare class GpsHeartbeatWorker {
    static process(job: Job): Promise<{
        processed: boolean;
        busId: any;
        timestamp: any;
    }>;
}
