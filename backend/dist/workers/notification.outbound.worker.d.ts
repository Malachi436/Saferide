import { Job } from 'bullmq';
export declare class NotificationOutboundWorker {
    static process(job: Job): Promise<{
        sent: boolean;
        notificationId: any;
        userId: any;
    }>;
}
