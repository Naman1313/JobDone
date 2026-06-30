import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { io } from '../index';
import User from '../models/User';
import Post from '../models/Post';

export const triggerSOS = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { location } = req.body;

        const user = await User.findById(userId);
        
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        if (user.role !== 'client') {
            res.status(403).json({ success: false, message: 'Only clients can trigger SOS' });
            return;
        }

        // Trigger emergency global broadcast
        io.emit('push_notification', {
            targetRole: 'worker', 
            title: '🚨 EMERGENCY SOS 🚨',
            body: `${user.name} has triggered an SOS alert nearby!`,
            url: `/map?lat=${location?.lat}&lng=${location?.lng}`,
            isEmergency: true
        });

        // Create a Social Feed alert
        await Post.create({
            authorId: user._id,
            content: `🚨 **URGENT SOS TRIGGERED** 🚨\n\nI am facing an emergency and need immediate assistance! Please check the map or contact me immediately if you are a worker nearby.\n\n📍 Location Coordinates: ${location?.lat?.toFixed(4)}, ${location?.lng?.toFixed(4)}`,
            hashtags: ['emergency', 'sos', 'urgent'],
            trade: 'emergency',
            isPublic: true,
            isJobPost: false
        });

        res.status(200).json({ success: true, message: 'SOS Triggered' });
    } catch (error) {
        console.error('Error triggering SOS:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
