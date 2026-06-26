import { Router } from 'express';
import { verifyOTP, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/verify-otp', verifyOTP);
router.get('/me', protect, getMe);

export default router; 
