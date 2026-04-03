import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000, // Slightly longer for cloud cold starts
      socketTimeoutMS: 45000,
      maxPoolSize: 10,                 // Production pooling
      retryWrites: true,
      retryReads: true,
    });
    
    console.log(`\x1b[32m✔ MongoDB Connected: ${conn.connection.host}\x1b[0m`);
  } catch (error: any) {
    console.error('\x1b[31m✘ CRITICAL: MongoDB connection failed.\x1b[0m');
    console.error(`Error: ${error.message}`);
    
    if (process.env.NODE_ENV === 'production') {
      // In production, we want the process to crash so the orchestrator (Render) restarts it
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

export default connectDB;
