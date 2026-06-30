import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getAuth } from 'firebase-admin/auth';
import { User } from '../models';

const generateToken = (userId: string, phone: string, role: string): string => {
    return jwt.sign(
        { userId, phone, role },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );
};

// POST /api/auth/verify-otp
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { idToken, role } = req.body;

        if (!idToken) {
            res.status(400).json({ success: false, message: 'idToken is required' });
            return;
        }

        // Verify Firebase ID token
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const phone = decodedToken.phone_number;

        if (!phone) {
            res.status(400).json({ success: false, message: 'Phone number not found in token' });
            return;
        }

        // Find or create user
        let user = await User.findOne({ phone });

        if (user) {
            // Existing user, log them in directly
            const token = generateToken(user._id.toString(), user.phone, user.role);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    user: {
                        _id: user._id,
                        phone: user.phone,
                        role: user.role,
                        name: user.name,
                        profilePhoto: user.profilePhoto,
                        isVerified: user.isVerified,
                        trustScore: user.trustScore,
                        trustTier: user.trustTier,
                        location: user.location,
                        address: user.address,
                    },
                    isNewUser: false,
                },
            });
            return;
        }

        // New User
        if (!role) {
            res.status(200).json({
                success: true,
                message: 'Role required for new user',
                data: {
                    isNewUser: true,
                    roleRequired: true
                }
            });
            return;
        }

        if (!['worker', 'client'].includes(role)) {
            res.status(400).json({ success: false, message: 'Role must be worker or client' });
            return;
        }

        user = await User.create({ phone, role });
        const token = generateToken(user._id.toString(), user.phone, user.role);

        res.status(200).json({
            success: true,
            message: 'Account created successfully',
            data: {
                token,
                user: {
                    _id: user._id,
                    phone: user.phone,
                    role: user.role,
                    name: user.name,
                    profilePhoto: user.profilePhoto,
                    isVerified: user.isVerified,
                    trustScore: user.trustScore,
                    trustTier: user.trustTier,
                    location: user.location,
                    address: user.address,
                },
                isNewUser: true,
            },
        });
    } catch (error) {
        console.error('verifyOTP error:', error);
        res.status(500).json({ success: false, message: 'Authentication failed' });
    }
};

// GET /api/auth/me
export const getMe = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user.userId).select('-__v');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};