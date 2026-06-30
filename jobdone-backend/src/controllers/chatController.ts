import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Conversation from '../models/Conversation';
import Message from '../models/Message';

// GET /api/conversations
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const conversations = await Conversation.find({ participants: userId })
            .populate('participants', 'name profilePhoto role isVerified')
            .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/conversations
export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const senderId = req.user?.userId;
        const { receiverId, jobContext } = req.body;

        if (!receiverId) {
            res.status(400).json({ success: false, message: 'receiverId is required' });
            return;
        }

        if (senderId === receiverId) {
            res.status(400).json({ success: false, message: 'Cannot start a conversation with yourself' });
            return;
        }

        // Check if exists
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                jobContext: jobContext || null
            });
        }

        res.status(201).json({ success: true, data: conversation });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/conversations/:id/messages
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const messages = await Message.find({ conversationId: id }).sort({ createdAt: 1 });

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/conversations/:id
export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const conversation = await Conversation.findById(id).populate('participants', 'name profilePhoto role isVerified');
        
        if (!conversation) {
            res.status(404).json({ success: false, message: 'Conversation not found' });
            return;
        }

        res.status(200).json({ success: true, data: conversation });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
