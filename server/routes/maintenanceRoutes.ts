import { Router } from 'express';
import {
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance
} from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getMaintenance);
router.post('/', protect, authorize('admin', 'operator'), createMaintenance);
router.put('/:id', protect, authorize('admin', 'operator'), updateMaintenance);
router.delete('/:id', protect, authorize('admin'), deleteMaintenance);

export default router;
