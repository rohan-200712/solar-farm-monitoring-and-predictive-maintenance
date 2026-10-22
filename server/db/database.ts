import mongoose from 'mongoose';

export async function connectDB(): Promise<boolean> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('[Database] MONGO_URI not configured. Running with in-memory embedded Mongoose-compatible data store.');
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log('[Database] Successfully connected to MongoDB at:', mongoUri);
    return true;
  } catch (error: any) {
    console.warn('[Database] Could not connect to external MongoDB (' + error.message + '). Active fallback store enabled.');
    return false;
  }
}
