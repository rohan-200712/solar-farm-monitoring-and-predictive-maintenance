import { Router } from 'express';
import { getReadings, getReadingsByDevice } from '../controllers/readingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getReadings);
router.get('/:deviceId', protect, getReadingsByDevice);

export default router;
