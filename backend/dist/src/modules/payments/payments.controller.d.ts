import { PaymentsService } from './payments.service';
declare class CreatePaymentIntentDto {
    parentId: string;
    amount: number;
    currency: string;
}
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: string;
        amount: number;
        currency: string;
        status: string;
        hubtleRef: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    processWebhook(signature: string, payload: any): Promise<{
        received: boolean;
    }>;
    getPaymentHistory(parentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: string;
        amount: number;
        currency: string;
        status: string;
        hubtleRef: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    getPaymentById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: string;
        amount: number;
        currency: string;
        status: string;
        hubtleRef: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
export {};
