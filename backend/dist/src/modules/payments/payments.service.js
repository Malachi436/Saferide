"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bullmq_1 = require("bullmq");
const ioredis_1 = require("ioredis");
const crypto = __importStar(require("crypto"));
let PaymentsService = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.redis = new ioredis_1.Redis(process.env.REDIS_URL);
        this.webhookQueue = new bullmq_1.Queue('payment.process_webhook', {
            connection: this.redis,
        });
    }
    async createPaymentIntent(parentId, amount, currency = 'UGX') {
        const hubtleRef = `hubtle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const paymentIntent = await this.prisma.paymentIntent.create({
            data: {
                parentId,
                amount,
                currency,
                status: 'pending',
                hubtleRef,
            },
        });
        return paymentIntent;
    }
    async processWebhook(signature, payload) {
        if (!this.isValidWebhookSignature(signature, payload)) {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        await this.webhookQueue.add('process-webhook', {
            payload,
        });
    }
    isValidWebhookSignature(signature, payload) {
        const expectedSignature = crypto
            .createHmac('sha256', process.env.HUBTLE_WEBHOOK_SECRET)
            .update(JSON.stringify(payload))
            .digest('hex');
        return signature === expectedSignature;
    }
    async getPaymentHistory(parentId) {
        return this.prisma.paymentIntent.findMany({
            where: { parentId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getPaymentById(id) {
        return this.prisma.paymentIntent.findUnique({
            where: { id },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map