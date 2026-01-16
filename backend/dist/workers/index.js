"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const ioredis_1 = require("ioredis");
const gps_heartbeat_worker_1 = require("./gps.heartbeat.worker");
const notification_outbound_worker_1 = require("./notification.outbound.worker");
const payment_process_webhook_worker_1 = require("./payment.process_webhook.worker");
const analytics_worker_1 = require("./analytics.worker");
const trip_daily_generation_worker_1 = require("./trip.daily_generation.worker");
const redis = new ioredis_1.Redis(process.env.REDIS_URL);
const tripGenerationQueue = new bullmq_1.Queue('trip.daily_generation', { connection: redis });
const gpsHeartbeatWorker = new bullmq_1.Worker('gps.heartbeat', gps_heartbeat_worker_1.GpsHeartbeatWorker.process, {
    connection: redis,
});
const notificationOutboundWorker = new bullmq_1.Worker('notification.outbound', notification_outbound_worker_1.NotificationOutboundWorker.process, {
    connection: redis,
});
const paymentProcessWebhookWorker = new bullmq_1.Worker('payment.process_webhook', payment_process_webhook_worker_1.PaymentProcessWebhookWorker.process, {
    connection: redis,
});
const analyticsWorker = new bullmq_1.Worker('analytics', analytics_worker_1.AnalyticsWorker.process, {
    connection: redis,
});
const tripDailyGenerationWorker = new bullmq_1.Worker('trip.daily_generation', trip_daily_generation_worker_1.TripDailyGenerationWorker.process, {
    connection: redis,
});
gpsHeartbeatWorker.on('failed', (job, err) => {
    console.error(`GPS Heartbeat job failed ${job.id}:`, err);
});
notificationOutboundWorker.on('failed', (job, err) => {
    console.error(`Notification Outbound job failed ${job.id}:`, err);
});
paymentProcessWebhookWorker.on('failed', (job, err) => {
    console.error(`Payment Process Webhook job failed ${job.id}:`, err);
});
analyticsWorker.on('failed', (job, err) => {
    console.error(`Analytics job failed ${job.id}:`, err);
});
tripDailyGenerationWorker.on('failed', (job, err) => {
    console.error(`Trip Daily Generation job failed ${job.id}:`, err);
});
tripGenerationQueue.add('generate-daily-trips', {}, {
    repeat: {
        pattern: '0 2 * * *',
    },
});
console.log('Workers started successfully');
console.log('Daily trip generation scheduled for 2 AM');
process.on('SIGTERM', async () => {
    console.log('Shutting down workers...');
    await gpsHeartbeatWorker.close();
    await notificationOutboundWorker.close();
    await paymentProcessWebhookWorker.close();
    await analyticsWorker.close();
    await tripDailyGenerationWorker.close();
    await tripGenerationQueue.close();
    await redis.quit();
    process.exit(0);
});
//# sourceMappingURL=index.js.map