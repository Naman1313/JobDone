import { Router } from 'express';
import {
    createBooking,
    getBookings,
    getBookingById,
    updateBookingStatus,
    completeBooking,
    getEarnings
} from '../controllers/bookingController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/earnings', restrictTo('worker'), getEarnings);
router.post('/', restrictTo('client'), createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.patch('/:id/status', restrictTo('worker'), updateBookingStatus);
router.post('/:id/complete', restrictTo('client'), completeBooking);

export default router;
