import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { ReelRequestSchema } from '../schemas/reel-request.schema.js';
import {
  createReel,
  getReelStatus,
  downloadReel,
} from '../controllers/reels.controller.js';

const router = Router();

router.post('/reels', validate(ReelRequestSchema), createReel);
router.get('/reels/:id/status', getReelStatus);
router.get('/reels/:id/download', downloadReel);

export default router;
