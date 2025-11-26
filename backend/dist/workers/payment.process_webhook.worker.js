"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProcessWebhookWorker = void 0;
class PaymentProcessWebhookWorker {
    static async process(job) {
        const { payload } = job.data;
        console.log('Processing payment webhook:', payload);
        console.log(`Processing payment webhook for event ${payload.eventType}`);
        await new Promise(resolve => setTimeout(resolve, 150));
        return { processed: true, eventId: payload.eventId };
    }
}
exports.PaymentProcessWebhookWorker = PaymentProcessWebhookWorker;
//# sourceMappingURL=payment.process_webhook.worker.js.map