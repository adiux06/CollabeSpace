import mongoose from 'mongoose';
import { Task } from './src/models/Task';
import dotenv from 'dotenv';

dotenv.config();

const countTasks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB connected');
    
    const tasks = await Task.find();
    console.log(`Total Tasks in DB: ${tasks.length}`);
    tasks.forEach(t => console.log(`- ${t.title} (Workspace: ${t.workspaceId})`));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

countTasks();
