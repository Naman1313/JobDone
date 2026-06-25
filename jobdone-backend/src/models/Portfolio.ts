import mongoose, { Document, Schema } from 'mongoose';

export interface IPortfolio extends Document {
    workerId: mongoose.Types.ObjectId;
    mediaUrl: string;
    mediaType: 'photo' | 'video';
    category: string;
    caption: string;
    toolsUsed: string[];
    beforeUrl: string;
    afterUrl: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolio>(
    {
        workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        mediaUrl: { type: String, required: true },
        mediaType: { type: String, enum: ['photo', 'video'], required: true },
        category: { type: String, required: true, trim: true },
        caption: { type: String, default: '', maxlength: 300 },
        toolsUsed: [{ type: String }],
        beforeUrl: { type: String, default: '' },
        afterUrl: { type: String, default: '' },
        isPublic: { type: Boolean, default: true },
    },
    { timestamps: true }
);

PortfolioSchema.index({ workerId: 1 });

export default mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);