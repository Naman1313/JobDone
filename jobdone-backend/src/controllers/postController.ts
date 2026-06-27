import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Post from '../models/Post';

import fs from 'fs';
import { uploadMedia } from '../utils/uploadMedia';

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { content, trade, hashtags, isPublic } = req.body;
        const files = req.files as Express.Multer.File[];

        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const uploadedUrls: string[] = [];
        
        if (files && files.length > 0) {
            for (const file of files) {
                const isVideo = file.mimetype.startsWith('video');
                const uploadType = isVideo ? 'video' : 'image';
                const result = await uploadMedia(file.path, 'posts', uploadType);
                uploadedUrls.push(result.secure_url);
                fs.unlinkSync(file.path);
            }
        }

        const newPost = await Post.create({
            authorId: req.user.userId,
            content: content || '',
            mediaUrls: uploadedUrls,
            trade: trade || '',
            hashtags: hashtags ? (typeof hashtags === 'string' ? JSON.parse(hashtags) : hashtags) : [],
            isPublic: isPublic !== undefined ? isPublic : true
        });

        res.status(201).json({ success: true, data: newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getFeed = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { trade, limit = 20, page = 1 } = req.query;
        
        const matchStage: any = { isPublic: true };
        if (trade) {
            matchStage.trade = new RegExp(trade as string, 'i');
        }

        const skip = (Number(page) - 1) * Number(limit);

        const posts = await Post.find(matchStage)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('authorId', 'name profilePhoto isVerified trustScore'); // Populate worker details

        res.status(200).json({ success: true, count: posts.length, data: posts });
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const post = await Post.findById(id);
        
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }

        const userId = new mongoose.Types.ObjectId(req.user.userId);
        const index = post.likes.indexOf(userId);

        if (index === -1) {
            // Add like
            post.likes.push(userId);
        } else {
            // Remove like
            post.likes.splice(index, 1);
        }

        await post.save();

        res.status(200).json({ success: true, data: post.likes.length });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const savePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const post = await Post.findById(id);
        
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }

        const userId = new mongoose.Types.ObjectId(req.user.userId);
        const index = post.saves.indexOf(userId);

        if (index === -1) {
            post.saves.push(userId);
        } else {
            post.saves.splice(index, 1);
        }

        await post.save();

        res.status(200).json({ success: true, message: index === -1 ? 'Post saved' : 'Post unsaved' });
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
