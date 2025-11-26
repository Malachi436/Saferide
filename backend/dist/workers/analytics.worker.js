"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsWorker = void 0;
class AnalyticsWorker {
    static async process(job) {
        const { type, data } = job.data;
        console.log(`Processing analytics job of type ${type}`);
        console.log(`Processing analytics job: ${type}`);
        await new Promise(resolve => setTimeout(resolve, 300));
        if (Math.random() < 0.05) {
            throw new Error('Failed to process analytics job');
        }
        return { processed: true, type, timestamp: new Date().toISOString() };
    }
}
exports.AnalyticsWorker = AnalyticsWorker;
//# sourceMappingURL=analytics.worker.js.map