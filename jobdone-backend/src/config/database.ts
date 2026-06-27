import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        if (!process.env.MONGODB_URI) {
            console.warn('MONGODB_URI is not defined. Skipping database connection.');
            return;
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI as string);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // process.exit(1);
    }
};

export default connectDB;