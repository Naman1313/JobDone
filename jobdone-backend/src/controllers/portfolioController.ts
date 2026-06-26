import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Portfolio } from '../models';
import { uploadMedia } from '../utils/uploadMedia';
import fs from 'fs';

// GET /api/portfolio/:workerId
export const getPortfolio = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { workerId } = req.params;
        const portfolio = await Portfolio.find({ workerId, isPublic: true })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: portfolio });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/portfolio
export const addPortfolioItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const workerId = req.user?.userId;
        const file = req.file;

        if (!file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }

        const { category, caption, toolsUsed, beforeUrl, afterUrl } = req.body;

        // Upload to Cloudinary
        const isVideo = file.mimetype.startsWith('video');
        const mediaType = isVideo ? 'video' : 'photo' as 'photo' | 'video';
        const uploadType = isVideo ? 'video' : 'image' as 'image' | 'video';
        const result = await uploadMedia(file.path, 'portfolio', uploadType);

        // Delete temp file
        fs.unlinkSync(file.path);

        const portfolioItem = await Portfolio.create({
            workerId,
            mediaUrl: result.secure_url,
            mediaType,
            category,
            caption,
            toolsUsed: toolsUsed ? JSON.parse(toolsUsed) : [],
            beforeUrl: beforeUrl || '',
            afterUrl: afterUrl || '',
        });

        res.status(201).json({ success: true, data: portfolioItem });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/portfolio/:itemId
export const deletePortfolioItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { itemId } = req.params;
        const workerId = req.user?.userId;

        const item = await Portfolio.findById(itemId);
        if (!item) {
            res.status(404).json({ success: false, message: 'Portfolio item not found' });
            return;
        }

        if (item.workerId.toString() !== workerId) {
            res.status(403).json({ success: false, message: 'Unauthorized' });
            return;
        }

        await Portfolio.findByIdAndDelete(itemId);
        res.status(200).json({ success: true, message: 'Portfolio item deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};