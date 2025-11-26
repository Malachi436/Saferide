import { Job } from 'bullmq';
export declare class AnalyticsWorker {
    static process(job: Job): Promise<{
        processed: boolean;
        type: any;
        timestamp: string;
    }>;
}
