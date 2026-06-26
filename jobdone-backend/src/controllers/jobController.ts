import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Job from '../models/Job';
import Booking from '../models/Booking';
import User from '../models/User';
import WorkerProfile from '../models/WorkerProfile';

export const getJobs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { lat, lng, radius = 5000, trade, minBudget, maxBudget, urgency } = req.query;

        if (!lat || !lng) {
            res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
            return;
        }

        const matchStage: any = { status: 'open' };

        if (trade) matchStage.trade = new RegExp(trade as string, 'i');
        if (urgency) matchStage.urgency = urgency;
        if (minBudget || maxBudget) {
            matchStage.budget = {};
            if (minBudget) matchStage.budget.$gte = Number(minBudget);
            if (maxBudget) matchStage.budget.$lte = Number(maxBudget);
        }

        const jobs = await Job.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [Number(lng), Number(lat)],
                    },
                    distanceField: 'distance',
                    maxDistance: Number(radius),
                    spherical: true,
                },
            },
            { $match: matchStage },
            { $sort: { distance: 1, createdAt: -1 } },
        ]);

        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description, trade, budget, coordinates, address, urgency, expiryDays } = req.body;

        if (!req.user || req.user.role !== 'client') {
            res.status(403).json({ success: false, message: 'Only clients can post jobs' });
            return;
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (Number(expiryDays) || 7));

        const newJob = await Job.create({
            clientId: req.user.userId,
            title,
            description,
            trade,
            budget,
            location: {
                type: 'Point',
                coordinates,
                address,
            },
            urgency,
            expiresAt,
            status: 'open'
        });

        res.status(201).json({ success: true, data: newJob });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const applyToJob = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!req.user || req.user.role !== 'worker') {
            res.status(403).json({ success: false, message: 'Only workers can apply to jobs' });
            return;
        }

        const job = await Job.findById(id);
        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }

        if (job.status !== 'open') {
            res.status(400).json({ success: false, message: 'Job is no longer open' });
            return;
        }

        const hasApplied = job.applicants.some(app => app.workerId.toString() === req.user?.userId);
        if (hasApplied) {
            res.status(400).json({ success: false, message: 'You have already applied to this job' });
            return;
        }

        job.applicants.push({
            workerId: new mongoose.Types.ObjectId(req.user.userId),
            message: message || '',
            appliedAt: new Date()
        });

        await job.save();

        res.status(200).json({ success: true, message: 'Applied successfully' });
    } catch (error) {
        console.error('Error applying to job:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getJobApplicants = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id);

        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }

        if (job.clientId.toString() !== req.user?.userId) {
            res.status(403).json({ success: false, message: 'Not authorized to view these applicants' });
            return;
        }

        // Populate the workerId with basic user info and worker profile info
        const populatedJob = await Job.findById(id).populate({
            path: 'applicants.workerId',
            select: 'name profilePhoto isVerified trustScore'
        });

        res.status(200).json({ success: true, data: populatedJob?.applicants || [] });
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const hireWorker = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id, workerId } = req.params;

        if (!req.user || req.user.role !== 'client') {
            res.status(403).json({ success: false, message: 'Only clients can hire workers' });
            return;
        }

        const job = await Job.findById(id);

        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }

        if (job.clientId.toString() !== req.user.userId) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }

        if (job.status !== 'open') {
            res.status(400).json({ success: false, message: 'Job is already filled or closed' });
            return;
        }

        // Verify the worker actually applied
        const isApplicant = job.applicants.some(app => app.workerId.toString() === workerId);
        if (!isApplicant) {
            res.status(400).json({ success: false, message: 'Worker did not apply for this job' });
            return;
        }

        // Update Job Status
        job.status = 'filled';
        job.selectedWorker = new mongoose.Types.ObjectId(workerId as string);
        await job.save();

        // Create Booking Record
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + 1); // Mock: Scheduled for tomorrow

        const platformFee = job.budget * 0.05; // 5% fee
        const newBooking = await Booking.create({
            jobId: job._id,
            workerId: new mongoose.Types.ObjectId(workerId as string),
            clientId: req.user.userId,
            scheduledAt: scheduledDate,
            status: 'requested',
            amount: job.budget,
            platformFee: platformFee,
            totalAmount: job.budget + platformFee,
            escrowStatus: 'held',
            address: job.location.address
        });

        // Trigger Notification Logic Here (Phase 4)

        res.status(200).json({
            success: true,
            message: 'Worker hired successfully, booking created',
            data: { job, booking: newBooking }
        });
    } catch (error) {
        console.error('Error hiring worker:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
