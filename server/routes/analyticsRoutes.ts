import { Router } from 'express';
import {
  getDashboardSummary,
  getEnergyAnalytics,
  getEfficiencyAnalytics,
  getFaultAnalytics
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/summary', protect, getDashboardSummary);
router.get('/energy', protect, getEnergyAnalytics);
router.get('/efficiency', protect, getEfficiencyAnalytics);
router.get('/faults', protect, getFaultAnalytics);

export default router;
