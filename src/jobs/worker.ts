import { Worker } from 'bullmq';
import { config } from '../config/index.js';
import { runPipeline } from '../services/pipeline.service.js';
import { logger } from '../utils/logger.js';

export const reelWorker = new Worker(
  'reel-generation',
  async (job) => {
    logger.info({ jobId: job.id, reelId: job.data.reelId }, 'Processing reel job');
    const result = await runPipeline(job.data, job);
    logger.info({ jobId: job.id, reelId: job.data.reelId }, 'Reel job complete');
    return result;
  },
  {
    connection: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
    },
    concurrency: 2,
  },
);

reelWorker.on('failed', (job, err) => {
  logger.error(
    { jobId: job?.id, reelId: job?.data?.reelId, err },
    'Reel job failed',
  );
});
