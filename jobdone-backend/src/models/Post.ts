import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
    authorId: mongoose.Types.ObjectId;
    content: string;
    mediaUrls: string[];
    trade: string;
    hashtags: string[];
    likes: mongoose.Types.ObjectId[];
    saves: mongoose.Types.ObjectId[];
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
    {
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, default: '', maxlength: 2000 },
        mediaUrls: [{ type: String }],
        trade: { type: String, default: '', trim: true },
        hashtags: [{ type: String, trim: true }],
        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        saves: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        isPublic: { type: Boolean, default: true },
    },
    { timestamps: true }
);

PostSchema.index({ authorId: 1 });
PostSchema.index({ trade: 1 });
PostSchema.index({ hashtags: 1 });

export default mongoose.model<IPost>('Post', PostSchema);