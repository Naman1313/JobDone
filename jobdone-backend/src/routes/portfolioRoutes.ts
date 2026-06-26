import { Router } from 'express';
import {
    getPortfolio,
    addPortfolioItem,
    deletePortfolioItem,
} from '../controllers/portfolioController';
import { protect, restrictTo } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';

const router = Router();

router.get('/:workerId', getPortfolio);
router.post('/', protect, restrictTo('worker'), uploadSingle, addPortfolioItem);
router.delete('/:itemId', protect, restrictTo('worker'), deletePortfolioItem);

export default router;