import type { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: Error & { statusCode?: number },
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');

  const statusCode = err.statusCode ?? 500;
  res.status(statusCode).json({
    error:
      config.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
}
