import { PrismaService } from '../../prisma/prisma.service';
export declare class PaymentPlanService {
    private prisma;
    constructor(prisma: PrismaService);
    getPaymentPlans(companyId: string): Promise<{
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
    createPaymentPlan(companyId: string, createPaymentPlanDto: {
        name: string;
        amount: number;
        frequency: string;
        description?: string;
        features?: string[];
    }): Promise<{
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
    updatePaymentPlan(id: string, updatePaymentPlanDto: {
        name?: string;
        amount?: number;
        frequency?: string;
        description?: string;
        features?: string[];
        isActive?: boolean;
    }): Promise<{
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
