import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    createWorkerProfile,
    getNearbyWorkers,
} from '../controllers/profileController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.get('/nearby', protect, getNearbyWorkers);
router.post('/worker', protect, restrictTo('worker'), createWorkerProfile);
router.get('/:userId', getProfile);
router.put('/:userId', protect, updateProfile);

export default router;