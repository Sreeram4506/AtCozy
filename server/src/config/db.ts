import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error('CRITICAL: MongoDB connection failed.');
    console.error(`Error: ${error.message}`);
    console.warn('The common reason is that you\'re trying to access the database from an IP that isn\'t whitelisted.');
    console.warn('Please whitelist your current IP address in your MongoDB Atlas cluster settings.');
    // Do not exit process in development to avoid ERR_CONNECTION_REFUSED for the whole API
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

export default connectDB;
