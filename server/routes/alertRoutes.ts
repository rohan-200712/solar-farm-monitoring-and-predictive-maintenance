import { Router } from 'express';
import { getAlerts, updateAlert, triggerTestSpike } from '../controllers/alertController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getAlerts);
router.put('/:id', protect, authorize('admin', 'operator'), updateAlert);
router.post('/test-spike', protect, triggerTestSpike);

export default router;
