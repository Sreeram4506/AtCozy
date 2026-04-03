import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { toNodeHandler } from 'better-auth/node';

dotenv.config();

async function createAdmin() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is not defined');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Import auth after connection so mongoose is ready
    const { auth } = await import('../lib/auth.js');
    
    const adminEmail = 'admin@atcozy.com';
    const adminName = 'AtCozy Admin';
    const adminPassword = 'AtCozy2026!'; // Default secure password

    console.log(`Creating admin account: ${adminEmail}...`);

    // Better Auth sign up - this handles password hashing
    const user = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        // Passing role as an additional field
        role: 'admin'
      }
    });

    console.log('✅ Admin account created successfully!');
    console.log('--- Credentials ---');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('-------------------');

    process.exit(0);
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('ℹ️ Admin account already exists in Better Auth.');
    } else {
      console.error('❌ Failed to create admin:', error);
    }
    process.exit(1);
  }
}

createAdmin();
