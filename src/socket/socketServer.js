import { Server } from 'socket.io';
import { addUserSocket, removeUserSocket } from './socketRegistry.js';

let io;

export const initSocket = httpServer => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', socket => {
    console.log('✅ Socket connected:', socket.id);

    socket.on('register', userId => {
      addUserSocket(userId, socket);

      socket.emit('registration-success', {
        userId,
        message: 'Socket registered',
      });
    });

    socket.on('disconnect', () => {
      removeUserSocket(socket.id);
      console.log('❌ Socket disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => io;
