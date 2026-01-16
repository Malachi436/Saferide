import { Worker, Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { GpsHeartbeatWorker } from './gps.heartbeat.worker';
import { NotificationOutboundWorker } from './notification.outbound.worker';
import { PaymentProcessWebhookWorker } from './payment.process_webhook.worker';
import { AnalyticsWorker } from './analytics.worker';
import { TripDailyGenerationWorker } from './trip.daily_generation.worker';

const redis = new Redis(process.env.REDIS_URL);

// Initialize queues
const tripGenerationQueue = new Queue('trip.daily_generation', { connection: redis });

// Initialize workers
const gpsHeartbeatWorker = new Worker('gps.heartbeat', GpsHeartbeatWorker.process, {
  connection: redis,
});

const notificationOutboundWorker = new Worker('notification.outbound', NotificationOutboundWorker.process, {
  connection: redis,
});

const paymentProcessWebhookWorker = new Worker('payment.process_webhook', PaymentProcessWebhookWorker.process, {
  connection: redis,
});

const analyticsWorker = new Worker('analytics', AnalyticsWorker.process, {
  connection: redis,
});

const tripDailyGenerationWorker = new Worker('trip.daily_generation', TripDailyGenerationWorker.process, {
  connection: redis,
});

// Handle worker errors
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

// Schedule daily trip generation at 2 AM
tripGenerationQueue.add(
  'generate-daily-trips',
  {},
  {
    repeat: {
      pattern: '0 2 * * *', // Every day at 2 AM
    },
  }
);

console.log('Workers started successfully');
console.log('Daily trip generation scheduled for 2 AM');

// Graceful shutdown
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