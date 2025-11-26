import { Job } from 'bullmq';
export declare class PaymentProcessWebhookWorker {
    static process(job: Job): Promise<{
        processed: boolean;
        eventId: any;
    }>;
}
