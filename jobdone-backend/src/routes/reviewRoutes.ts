import { Router } from 'express';
import { createReview } from '../controllers/reviewController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createReview);

export default router;
