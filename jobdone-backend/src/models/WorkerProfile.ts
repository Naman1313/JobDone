import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkerProfile extends Document {
    userId: mongoose.Types.ObjectId;
    trade: string;
    yearsExp: number;
    hourlyRate: number;
    languages: string[];
    availability: 'available' | 'busy' | 'offline';
    isEmergencyAvailable: boolean;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    serviceRadius: number;
    aadhaarStatus: 'not_uploaded' | 'pending' | 'verified' | 'rejected';
    aadhaarFrontUrl: string;
    aadhaarBackUrl: string;
    skills: string[];
    certifications: string[];
    bio: string;
    createdAt: Date;
    updatedAt: Date;
}

const WorkerProfileSchema = new Schema<IWorkerProfile>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        trade: { type: String, required: true, trim: true },
        yearsExp: { type: Number, default: 0, min: 0 },
        hourlyRate: { type: Number, required: true, min: 0 },
        languages: [{ type: String }],
        availability: {
            type: String,
            enum: ['available', 'busy', 'offline'],
            default: 'available',
        },
        isEmergencyAvailable: { type: Boolean, default: false },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
        },
        serviceRadius: { type: Number, default: 10 },
        aadhaarStatus: {
            type: String,
            enum: ['not_uploaded', 'pending', 'verified', 'rejected'],
            default: 'not_uploaded',
        },
        aadhaarFrontUrl: { type: String, default: '' },
        aadhaarBackUrl: { type: String, default: '' },
        skills: [{ type: String }],
        certifications: [{ type: String }],
        bio: { type: String, default: '', maxlength: 500 },
    },
    { timestamps: true }
);

WorkerProfileSchema.index({ location: '2dsphere' });

export default mongoose.model<IWorkerProfile>('WorkerProfile', WorkerProfileSchema);