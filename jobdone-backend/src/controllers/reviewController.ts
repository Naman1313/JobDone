import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Review from '../models/Review';
import Booking from '../models/Booking';
import User from '../models/User';
import { io } from '../index';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { bookingId, workerId, rating, text } = req.body;
        const clientId = req.user?.userId;

        // Verify booking
        const booking = await Booking.findById(bookingId);
        if (!booking || booking.clientId.toString() !== clientId || booking.status !== 'completed') {
            res.status(400).json({ success: false, message: 'Invalid booking for review' });
            return;
        }

        const existing = await Review.findOne({ bookingId });
        if (existing) {
            res.status(400).json({ success: false, message: 'Review already exists for this booking' });
            return;
        }

        const review = await Review.create({
            bookingId,
            workerId,
            reviewerId: clientId,
            rating,
            text
        });

        // Update worker trust score
        const worker = await User.findById(workerId);
        if (worker) {
            // Very simple rating impact logic
            const scoreChange = rating >= 4 ? 5 : (rating <= 2 ? -10 : 0);
            worker.trustScore = Math.max(0, Math.min(100, worker.trustScore + scoreChange));
            
            // Re-evaluate tier
            if (worker.trustScore >= 90) worker.trustTier = 'Platinum';
            else if (worker.trustScore >= 70) worker.trustTier = 'Gold';
            else if (worker.trustScore >= 40) worker.trustTier = 'Silver';
            else worker.trustTier = 'Bronze';

            await worker.save();
            
            // Trigger push notification to worker
            io.emit('push_notification', {
                targetUserId: workerId,
                title: 'New Review Received! ⭐',
                body: `You received a ${rating}-star review from a client.`,
                url: `/profile/me`
            });
        }

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
