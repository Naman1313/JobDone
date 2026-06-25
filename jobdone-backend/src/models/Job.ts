import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
    clientId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    trade: string;
    budget: number;
    location: {
        type: 'Point';
        coordinates: [number, number];
        address: string;
    };
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    status: 'open' | 'filled' | 'closed' | 'completed';
    applicants: {
        workerId: mongoose.Types.ObjectId;
        message: string;
        appliedAt: Date;
    }[];
    selectedWorker: mongoose.Types.ObjectId;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
    {
        clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, maxlength: 1000 },
        trade: { type: String, required: true, trim: true },
        budget: { type: Number, required: true, min: 0 },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true },
            address: { type: String, required: true },
        },
        urgency: {
            type: String,
            enum: ['low', 'medium', 'high', 'emergency'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['open', 'filled', 'closed', 'completed'],
            default: 'open',
        },
        applicants: [
            {
                workerId: { type: Schema.Types.ObjectId, ref: 'User' },
                message: { type: String, default: '' },
                appliedAt: { type: Date, default: Date.now },
            },
        ],
        selectedWorker: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

JobSchema.index({ location: '2dsphere' });
JobSchema.index({ trade: 1, status: 1 });

export default mongoose.model<IJob>('Job', JobSchema);