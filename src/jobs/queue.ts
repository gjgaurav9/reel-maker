import { Queue } from 'bullmq';
import { config } from '../config/index.js';

export const reelQueue = new Queue('reel-generation', {
  connection: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  },
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 86400 },   // 24 hours
    removeOnFail: { age: 604800 },      // 7 days
  },
});
