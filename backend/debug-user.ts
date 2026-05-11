import mongoose from 'mongoose';
import { User } from './src/models/User';
import { Workspace } from './src/models/Workspace';
import { Task } from './src/models/Task';
import dotenv from 'dotenv';

dotenv.config();

const debugUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB connected');
    
    const user = await User.findOne({ email: 'coderadi08@gmail.com' });
    if (!user) {
      console.log('User not found');
      process.exit(0);
    }
    console.log(`Found user: ${user.email} (${user._id})`);

    const workspaces = await Workspace.find({ 'members.userId': user._id });
    console.log(`Workspaces: ${workspaces.length}`);
    for (const w of workspaces) {
      console.log(`- ${w.name} (${w._id})`);
      const tasks = await Task.find({ workspaceId: w._id });
      console.log(`  Tasks: ${tasks.length}`);
      tasks.forEach(t => console.log(`    -> ${t.title} [${t.status}]`));
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

debugUser();
