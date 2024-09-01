import mongoose from 'mongoose';

export async function connectDB(uri?: string): Promise<void> {
  try {
    if (typeof uri !== 'string') {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1);
  }
};
