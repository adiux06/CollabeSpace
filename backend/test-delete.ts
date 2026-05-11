import mongoose from 'mongoose';
import { User } from './src/models/User';
import { Task } from './src/models/Task';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const testDelete = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB connected');
    
    const user = await User.findOne({ email: 'coderadi08@gmail.com' });
    if (!user) return console.log('User not found');
    
    const data = JSON.stringify({ email: 'coderadi08@gmail.com', password: 'password123' });
    const reqLogin = http.request({
      hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', async () => {
        const { accessToken } = JSON.parse(body);
        
        // Find a task
        const tasks = await Task.find();
        if (tasks.length === 0) return console.log('No tasks found to delete');
        
        const taskId = tasks[0]._id;
        console.log('Trying to delete task', taskId);
        
        const reqDel = http.request({
          hostname: 'localhost', port: 5000, path: `/api/tasks/${taskId}`, method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }, (resDel) => {
          let bDel = '';
          resDel.on('data', c => bDel+=c);
          resDel.on('end', () => console.log('Delete Status:', resDel.statusCode, bDel));
        });
        reqDel.end();
      });
    });
    reqLogin.write(data);
    reqLogin.end();

  } catch (error) {
    console.error(error);
  }
};

testDelete();
