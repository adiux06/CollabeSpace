import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174', process.env.FRONTEND_URL || ''],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const workspaceUsers: Record<string, Set<string>> = {};

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-workspace', ({ workspaceId, userId, userName }) => {
      socket.join(workspaceId);
      
      // Store user info in socket object for easy access on disconnect
      (socket as any).workspaceId = workspaceId;
      (socket as any).userId = userId;
      (socket as any).userName = userName;

      if (!workspaceUsers[workspaceId]) {
        workspaceUsers[workspaceId] = new Set();
      }
      workspaceUsers[workspaceId].add(JSON.stringify({ userId, userName }));

      io.to(workspaceId).emit('presence-update', Array.from(workspaceUsers[workspaceId]).map(u => JSON.parse(u)));
      console.log(`User ${userName} joined workspace ${workspaceId}`);
    });

    socket.on('leave-workspace', (workspaceId) => {
      socket.leave(workspaceId);
      
      if (workspaceUsers[workspaceId] && (socket as any).userId) {
        workspaceUsers[workspaceId].delete(JSON.stringify({ 
          userId: (socket as any).userId, 
          userName: (socket as any).userName 
        }));
        io.to(workspaceId).emit('presence-update', Array.from(workspaceUsers[workspaceId]).map(u => JSON.parse(u)));
      }
    });

    socket.on('typing', ({ workspaceId, userId, userName }) => {
      socket.to(workspaceId).emit('user-typing', { userId, userName });
    });

    socket.on('stop-typing', ({ workspaceId, userId }) => {
      socket.to(workspaceId).emit('user-stop-typing', { userId });
    });

    socket.on('disconnect', () => {
      const { workspaceId, userId, userName } = (socket as any);
      if (workspaceId && workspaceUsers[workspaceId]) {
        workspaceUsers[workspaceId].delete(JSON.stringify({ userId, userName }));
        io.to(workspaceId).emit('presence-update', Array.from(workspaceUsers[workspaceId]).map(u => JSON.parse(u)));
      }
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // Attach io to app to use in controllers if needed
  app.set('io', io);

  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
