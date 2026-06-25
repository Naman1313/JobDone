import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkHistory extends Document {
    workerId: mongoose.Types.ObjectId;
    clientId: mongoose.Types.ObjectId;
    bookingId: mongoose.Types.ObjectId;
    location: {
        type: 'Point';
        coordinates: [number, number];
        address: string;
    };
    jobCategory: string;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const WorkHistorySchema = new Schema<IWorkHistory>(
    {
        workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true },
            address: { type: String, required: true },
        },
        jobCategory: { type: String, required: true, trim: true },
        completedAt: { type: Date, required: true },
    },
    { timestamps: true }
);

WorkHistorySchema.index({ location: '2dsphere' });
WorkHistorySchema.index({ workerId: 1, completedAt: -1 });

export default mongoose.model<IWorkHistory>('WorkHistory', WorkHistorySchema);