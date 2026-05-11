import mongoose from 'mongoose';
import { User } from './src/models/User';
import { Workspace } from './src/models/Workspace';
import dotenv from 'dotenv';

dotenv.config();

const debugQuery = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB connected');
    
    const user = await User.findOne({ email: 'coderadi08@gmail.com' });
    if (!user) {
      console.log('User not found');
      process.exit(0);
    }
    
    const workspaces = await Workspace.find({ 'members.userId': user._id });
    console.log(`With members.userId (${user._id}):`, workspaces.length);

    const workspaces2 = await Workspace.find({ createdBy: user._id });
    console.log(`With createdBy:`, workspaces2.length);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

debugQuery();
