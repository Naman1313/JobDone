import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    createWorkerProfile,
    getNearbyWorkers,
    getWorkerHistory,
    addWorkHistory,
    verifyWorker
} from '../controllers/profileController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.get('/nearby', protect, getNearbyWorkers);
router.post('/worker', protect, restrictTo('worker'), createWorkerProfile);
router.post('/verify', protect, restrictTo('worker'), verifyWorker);

// Work History
router.get('/:id/history', protect, getWorkerHistory);
router.post('/history', protect, addWorkHistory);

router.get('/:userId', getProfile);
router.put('/:userId', protect, updateProfile);

export default router;