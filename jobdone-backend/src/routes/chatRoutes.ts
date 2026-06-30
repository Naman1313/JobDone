import { Router } from 'express';
import {
    getConversations,
    createConversation,
    getMessages,
    getConversation
} from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:id', getConversation);
router.get('/:id/messages', getMessages);

export default router;
