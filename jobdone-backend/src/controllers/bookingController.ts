import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Booking from '../models/Booking';
import Job from '../models/Job';

// POST /api/bookings
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { jobId, workerId, scheduledAt, amount, address } = req.body;
        const clientId = req.user?.userId;

        // Mock payment flow: We just assume payment is successful and escrow is held
        const platformFee = amount * 0.1; // 10%
        const totalAmount = amount + platformFee;

        const booking = await Booking.create({
            jobId,
            workerId,
            clientId,
            scheduledAt,
            amount,
            platformFee,
            totalAmount,
            escrowStatus: 'held',
            address
        });

        // Update Job Status
        await Job.findByIdAndUpdate(jobId, { status: 'filled' });

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/bookings
export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        const query = role === 'worker' ? { workerId: userId } : { clientId: userId };

        const bookings = await Booking.find(query)
            .populate('workerId', 'name profilePhoto phone')
            .populate('clientId', 'name profilePhoto phone')
            .populate('jobId', 'title trade')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        console.error('Error getting bookings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/bookings/:id
export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id)
            .populate('workerId', 'name profilePhoto phone')
            .populate('clientId', 'name profilePhoto phone')
            .populate('jobId', 'title trade description');

        if (!booking) {
            res.status(404).json({ success: false, message: 'Booking not found' });
            return;
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PATCH /api/bookings/:id/status
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/bookings/:id/complete
export const completeBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const booking = await Booking.findByIdAndUpdate(
            id, 
            { 
                status: 'completed', 
                escrowStatus: 'released',
                completedAt: new Date()
            }, 
            { new: true }
        );

        // Here we would normally trigger the addWorkHistory as well, or the frontend can call it.
        // For simplicity, we just return the released booking.

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/bookings/earnings
export const getEarnings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workerId = req.user?.userId;
        const bookings = await Booking.find({ workerId });

        let pending = 0;
        let withdrawn = 0;

        bookings.forEach(b => {
            if (b.escrowStatus === 'held') {
                pending += b.amount;
            } else if (b.escrowStatus === 'released') {
                withdrawn += b.amount; // Treating released as withdrawn for dummy logic
            }
        });

        res.status(200).json({ success: true, data: { pending, withdrawn, total: pending + withdrawn } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
