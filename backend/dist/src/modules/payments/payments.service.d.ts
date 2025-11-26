import { PrismaService } from '../../prisma/prisma.service';
import { PaymentIntent } from '@prisma/client';
export declare class PaymentsService {
    private prisma;
    private readonly webhookQueue;
    private readonly redis;
    constructor(prisma: PrismaService);
    createPaymentIntent(parentId: string, amount: number, currency?: string): Promise<PaymentIntent>;
    processWebhook(signature: string, payload: any): Promise<void>;
    private isValidWebhookSignature;
    getPaymentHistory(parentId: string): Promise<PaymentIntent[]>;
    getPaymentById(id: string): Promise<PaymentIntent | null>;
}
