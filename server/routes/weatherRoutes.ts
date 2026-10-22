import { Router } from 'express';
import { getWeather } from '../controllers/weatherController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getWeather);
router.get('/current', protect, getWeather);

export default router;
