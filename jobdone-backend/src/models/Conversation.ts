import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    type: 'direct' | 'reference';
    jobContext: string;
    lastMessage: string;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
    {
        participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
        type: {
            type: String,
            enum: ['direct', 'reference'],
            default: 'direct',
        },
        jobContext: { type: String, default: '' },
        lastMessage: { type: String, default: '' },
        lastMessageAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

ConversationSchema.index({ participants: 1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);