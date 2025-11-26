"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationOutboundWorker = void 0;
class NotificationOutboundWorker {
    static async process(job) {
        const { notificationId, userId, title, message, type } = job.data;
        console.log(`Processing outbound notification ${notificationId} for user ${userId}`);
        console.log(`Sending notification to user ${userId}: ${title} - ${message}`);
        await new Promise(resolve => setTimeout(resolve, 200));
        if (Math.random() < 0.1) {
            throw new Error('Failed to send notification');
        }
        return { sent: true, notificationId, userId };
    }
}
exports.NotificationOutboundWorker = NotificationOutboundWorker;
//# sourceMappingURL=notification.outbound.worker.js.map