import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    bookingId: mongoose.Types.ObjectId;
    reviewerId: mongoose.Types.ObjectId;
    workerId: mongoose.Types.ObjectId;
    rating: number;
    punctualityRating: number;
    qualityRating: number;
    communicationRating: number;
    valueRating: number;
    text: string;
    photoUrl: string;
    workerReply: string;
    isOptedForReference: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
        reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        punctualityRating: { type: Number, default: 0, min: 0, max: 5 },
        qualityRating: { type: Number, default: 0, min: 0, max: 5 },
        communicationRating: { type: Number, default: 0, min: 0, max: 5 },
        valueRating: { type: Number, default: 0, min: 0, max: 5 },
        text: { type: String, default: '', maxlength: 500 },
        photoUrl: { type: String, default: '' },
        workerReply: { type: String, default: '', maxlength: 300 },
        isOptedForReference: { type: Boolean, default: false },
    },
    { timestamps: true }
);

ReviewSchema.index({ workerId: 1 });

export default mongoose.model<IReview>('Review', ReviewSchema);