import { Router } from 'express';
import {
    createPost,
    getFeed,
    likePost,
    savePost
} from '../controllers/postController';
import { protect, restrictTo } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';

const router = Router();

// Public / Authenticated discovery feed
router.get('/feed', protect, getFeed);

// All authenticated users can create posts
router.post('/', protect, uploadMultiple, createPost);

// All authenticated users can like or save a post
router.post('/:id/like', protect, likePost);
router.post('/:id/save', protect, savePost);

export default router;
