import mongoose from 'mongoose';
import { User } from './src/models/User';
import { Workspace } from './src/models/Workspace';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB connected');
    
    const users = await User.find();
    for (const user of users) {
      const existing = await Workspace.findOne({ createdBy: user._id });
      if (!existing) {
        await Workspace.create({
          name: `${user.name}'s Workspace`,
          description: 'Personal workspace',
          createdBy: user._id,
          members: [{ userId: user._id, role: 'admin' }]
        });
        console.log(`Created workspace for ${user.email}`);
      }
    }
    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

connectDB();
