import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { WorkHistory } from '../models';

// GET /api/workers/:id/history
export const getWorkerHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { lat, lng } = req.query;

        let query: any = { workerId: id };

        // If lat/lng provided, sort by distance (near me filter)
        let history;
        if (lat && lng) {
            history = await WorkHistory.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: [parseFloat(lng as string), parseFloat(lat as string)],
                        },
                        distanceField: 'distance',
                        spherical: true,
                        query: { workerId: id },
                    },
                },
                { $sort: { completedAt: -1 } },
                { $limit: 50 },
            ]);
        } else {
            history = await WorkHistory.find(query)
                .sort({ completedAt: -1 })
                .limit(50)
                .populate('clientId', 'name profilePhoto');
        }

        res.status(200).json({ success: true, data: history });
    } catch (error) {
        console.error('getWorkerHistory error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/workers/history
export const addWorkHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { workerId, clientId, bookingId, location, jobCategory, completedAt } = req.body;

        const history = await WorkHistory.create({
            workerId,
            clientId,
            bookingId,
            location: {
                type: 'Point',
                coordinates: [location.lng, location.lat],
                address: location.address,
            },
            jobCategory,
            completedAt: completedAt || new Date(),
        });

        res.status(201).json({ success: true, data: history });
    } catch (error) {
        console.error('addWorkHistory error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};