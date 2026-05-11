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

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-workspace', (workspaceId) => {
      socket.join(workspaceId);
      console.log(`Socket ${socket.id} joined workspace ${workspaceId}`);
    });

    socket.on('leave-workspace', (workspaceId) => {
      socket.leave(workspaceId);
      console.log(`Socket ${socket.id} left workspace ${workspaceId}`);
    });

    socket.on('typing', ({ taskId, userId, userName }) => {
      // Find which room (workspace) this socket is in
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room !== socket.id) {
          socket.to(room).emit('user-typing', { taskId, userId, userName });
        }
      });
    });

    socket.on('disconnect', () => {
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
