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

        const updateData: any = {};
        if (req.body.name !== undefined) updateData.name = req.body.name;
        if (req.body.profilePhoto !== undefined) updateData.profilePhoto = req.body.profilePhoto;
        if (req.body.location !== undefined) updateData.location = req.body.location;
        if (req.body.address !== undefined) updateData.address = req.body.address;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-__v');

        // Sync location to WorkerProfile if the user is a worker
        if (req.body.location && user?.role === 'worker') {
            await WorkerProfile.findOneAndUpdate(
                { userId },
                { location: req.body.location }
            );
        }

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
            availability: { $ne: 'offline' },
        };

        if (trade) {
            matchStage.trade = new RegExp(trade as string, 'i');
        }

        let workers = await WorkerProfile.aggregate([
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: [parseFloat(lng as string), parseFloat(lat as string)] },
                    distanceField: 'distance',
                    maxDistance: parseFloat(radius as string) * 1000,
                    spherical: true,
                }
            },
            { $match: matchStage },
            { $limit: 20 }
        ]);

        workers = await WorkerProfile.populate(workers, { 
            path: 'userId', 
            select: 'name profilePhoto trustScore trustTier isVerified' 
        });

        res.status(200).json({ success: true, data: workers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/workers/:id/history
export const getWorkerHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const history = await WorkHistory.find({ workerId: id })
            .populate('clientId', 'name profilePhoto')
            .sort({ completedAt: -1 })
            .limit(50);
            
        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/workers/history
export const addWorkHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { workerId, clientId, location, jobCategory } = req.body;

        const newHistory = await WorkHistory.create({
            workerId,
            clientId,
            location: {
                type: 'Point',
                coordinates: location.coordinates // [lng, lat]
            },
            jobCategory
        });

        res.status(201).json({ success: true, data: newHistory });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/workers/verify
export const verifyWorker = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { documentUrl } = req.body;

        if (!documentUrl) {
            res.status(400).json({ success: false, message: 'Document URL is required' });
            return;
        }

        // Mock verification logic
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        user.isVerified = true;
        user.trustScore = Math.min(100, user.trustScore + 20);
        
        // Upgrade trust tier based on score
        if (user.trustScore >= 90) user.trustTier = 'Platinum';
        else if (user.trustScore >= 70) user.trustTier = 'Gold';
        else if (user.trustScore >= 40) user.trustTier = 'Silver';
        
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: 'Verification successful',
            data: user 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};