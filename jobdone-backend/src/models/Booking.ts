import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
    jobId: mongoose.Types.ObjectId;
    workerId: mongoose.Types.ObjectId;
    clientId: mongoose.Types.ObjectId;
    scheduledAt: Date;
    status: 'requested' | 'accepted' | 'enroute' | 'inprogress' | 'completed' | 'cancelled';
    amount: number;
    platformFee: number;
    totalAmount: number;
    escrowStatus: 'held' | 'released' | 'refunded';
    razorpayOrderId: string;
    razorpayPaymentId: string;
    workOrderUrl: string;
    address: string;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
    {
        jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
        workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        scheduledAt: { type: Date, required: true },
        status: {
            type: String,
            enum: ['requested', 'accepted', 'enroute', 'inprogress', 'completed', 'cancelled'],
            default: 'requested',
        },
        amount: { type: Number, required: true, min: 0 },
        platformFee: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true, min: 0 },
        escrowStatus: {
            type: String,
            enum: ['held', 'released', 'refunded'],
            default: 'held',
        },
        razorpayOrderId: { type: String, default: '' },
        razorpayPaymentId: { type: String, default: '' },
        workOrderUrl: { type: String, default: '' },
        address: { type: String, required: true },
        completedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

BookingSchema.index({ workerId: 1, status: 1 });
BookingSchema.index({ clientId: 1, status: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);