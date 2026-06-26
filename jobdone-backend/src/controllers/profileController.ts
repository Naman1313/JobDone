import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User, WorkerProfile, Portfolio, Review, WorkHistory } from '../models';

// GET /api/profile/:userId
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-__v');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        let profileData: any = { user };

        if (user.role === 'worker') {
            const workerProfile = await WorkerProfile.findOne({ userId });
            const portfolio = await Portfolio.find({ workerId: userId, isPublic: true });
            const reviews = await Review.find({ workerId: userId })
                .populate('reviewerId', 'name profilePhoto')
                .sort({ createdAt: -1 })
                .limit(10);
            const workHistory = await WorkHistory.find({ workerId: userId })
                .sort({ completedAt: -1 })
                .limit(20);

            profileData = { user, workerProfile, portfolio, reviews, workHistory };
        }

        res.status(200).json({ success: true, data: profileData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/profile/:userId
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        if (req.user?.userId !== userId) {
            res.status(403).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { name: req.body.name, profilePhoto: req.body.profilePhoto },
            { new: true }
        ).select('-__v');

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/profile/worker
export const createWorkerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        const existing = await WorkerProfile.findOne({ userId });
        if (existing) {
            res.status(400).json({ success: false, message: 'Worker profile already exists' });
            return;
        }

        const {
            trade, yearsExp, hourlyRate, languages,
            location, serviceRadius, skills, certifications, bio
        } = req.body;

        const workerProfile = await WorkerProfile.create({
            userId,
            trade,
            yearsExp,
            hourlyRate,
            languages,
            location,
            serviceRadius,
            skills,
            certifications,
            bio,
        });

        res.status(201).json({ success: true, data: workerProfile });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/workers/nearby
export const getNearbyWorkers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { lat, lng, radius = 10, trade } = req.query;

        if (!lat || !lng) {
            res.status(400).json({ success: false, message: 'lat and lng are required' });
            return;
        }

        const matchStage: any = {
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lng as string), parseFloat(lat as string)] },
                    $maxDistance: parseFloat(radius as string) * 1000,
                },
            },
            availability: { $ne: 'offline' },
        };

        if (trade) matchStage.trade = trade;

        const workers = await WorkerProfile.find(matchStage)
            .populate('userId', 'name profilePhoto trustScore trustTier isVerified')
            .limit(20);

        res.status(200).json({ success: true, data: workers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};