import { PaymentPlanService } from './payment-plan.service';
export declare class PaymentPlanController {
    private readonly paymentPlanService;
    constructor(paymentPlanService: PaymentPlanService);
    getCompanyPaymentPlans(companyId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        amount: number;
        frequency: string;
        description: string | null;
        features: string[];
        isActive: boolean;
    }[]>;
    createPaymentPlan(companyId: string, createPaymentPlanDto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        amount: number;
        frequency: string;
        description: string | null;
        features: string[];
        isActive: boolean;
    }>;
    updatePaymentPlan(id: string, updatePaymentPlanDto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        amount: number;
        frequency: string;
        description: string | null;
        features: string[];
        isActive: boolean;
    }>;
    deletePaymentPlan(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        amount: number;
        frequency: string;
        description: string | null;
        features: string[];
        isActive: boolean;
    }>;
}
