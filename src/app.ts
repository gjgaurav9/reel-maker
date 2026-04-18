import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'node:path';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Serve generated audio/video files statically
app.use('/output', express.static(path.resolve(config.OUTPUT_DIR)));

app.use(routes);
app.use(errorHandler);

export default app;
