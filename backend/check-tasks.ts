import mongoose from 'mongoose';
import { User } from './src/models/User';
import { Workspace } from './src/models/Workspace';
import { Task } from './src/models/Task';
import dotenv from 'dotenv';

dotenv.config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB connected');
    
    const users = await User.find();
    console.log(`Users: ${users.length}`);

    const workspaces = await Workspace.find();
    console.log(`Workspaces: ${workspaces.length}`);
    workspaces.forEach(w => console.log(`- ${w.name} (${w._id})`));

    const tasks = await Task.find();
    console.log(`Tasks: ${tasks.length}`);
    tasks.forEach(t => console.log(`- ${t.title} [${t.status}] (Workspace: ${t.workspaceId})`));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkDB();
