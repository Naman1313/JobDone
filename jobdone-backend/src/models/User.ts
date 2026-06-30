import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    phone: string;
    role: 'worker' | 'client';
    name: string;
    profilePhoto: string;
    isVerified: boolean;
    trustScore: number;
    trustTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    isActive: boolean;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        phone: { type: String, required: true, unique: true, trim: true },
        role: { type: String, enum: ['worker', 'client'], required: true },
        name: { type: String, trim: true, default: '' },
        profilePhoto: { type: String, default: '' },
        isVerified: { type: Boolean, default: false },
        trustScore: { type: Number, default: 0, min: 0, max: 100 },
        trustTier: {
            type: String,
            enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
            default: 'Bronze',
        },
        isActive: { type: Boolean, default: true },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number] },
        },
        address: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);