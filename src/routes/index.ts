import { Router } from 'express';
import healthRoutes from './health.routes.js';
import reelsRoutes from './reels.routes.js';

const router = Router();

router.use(healthRoutes);
router.use('/api', reelsRoutes);

export default router;
