"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GpsHeartbeatWorker = void 0;
class GpsHeartbeatWorker {
    static async process(job) {
        const { busId, latitude, longitude, speed, timestamp } = job.data;
        console.log(`Processing GPS heartbeat for bus ${busId}`);
        console.log(`Bus ${busId} at ${latitude}, ${longitude} moving at ${speed} km/h`);
        await new Promise(resolve => setTimeout(resolve, 100));
        return { processed: true, busId, timestamp };
    }
}
exports.GpsHeartbeatWorker = GpsHeartbeatWorker;
//# sourceMappingURL=gps.heartbeat.worker.js.map