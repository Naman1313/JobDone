import { Router } from 'express';
import { triggerSOS } from '../controllers/emergencyController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/sos', protect, triggerSOS);

export default router;
