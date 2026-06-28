import { Router } from 'express';
import { getWorkerHistory, addWorkHistory } from '../controllers/workHistoryController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/:id/history', protect, getWorkerHistory);
router.post('/history', protect, addWorkHistory);

export default router;