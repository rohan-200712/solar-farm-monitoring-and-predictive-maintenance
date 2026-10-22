import { Router } from 'express';
import { getInverters, getInverterById, createInverter, updateInverter, deleteInverter } from '../controllers/inverterController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getInverters);
router.get('/:id', protect, getInverterById);
router.post('/', protect, authorize('admin', 'operator'), createInverter);
router.put('/:id', protect, authorize('admin', 'operator'), updateInverter);
router.delete('/:id', protect, authorize('admin'), deleteInverter);

export default router;
