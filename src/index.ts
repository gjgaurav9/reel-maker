import app from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

// Import worker to start processing jobs
import './jobs/worker.js';

app.listen(config.PORT, () => {
  logger.info(`Reel Maker server running on port ${config.PORT}`);
  logger.info(`Environment: ${config.NODE_ENV}`);
  logger.info('BullMQ worker started — ready to process reel jobs');
});
