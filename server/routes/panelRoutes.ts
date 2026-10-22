import { Router } from 'express';
import { getPanels, getPanelById, createPanel, updatePanel, deletePanel } from '../controllers/panelController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getPanels);
router.get('/:id', protect, getPanelById);
router.post('/', protect, authorize('admin', 'operator'), createPanel);
router.put('/:id', protect, authorize('admin', 'operator'), updatePanel);
router.delete('/:id', protect, authorize('admin'), deletePanel);

export default router;
