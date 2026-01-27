import { Server } from 'socket.io';

let io = null;
const userSockets = new Map(); // userId -> socketId

export const initSocketServer = server => {
  io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', socket => {
    console.log(`✅ [Socket] New connection: ${socket.id}`);

    // User registration
    socket.on('register', userId => {
      const id = String(userId);
      console.log(`📥 [Socket] User ${id} registered on socket ${socket.id}`);
      userSockets.set(id, socket.id);
      socket.userId = id;

      // Send confirmation
      socket.emit('registration-success', {
        message: `User ${id} successfully registered.`,
        userId: id,
      });
    });

    // Mark notification as read
    socket.on('mark-read', async notificationId => {
      try {
        const Notification = (await import('../models/notification.model.js')).default;
        const notification = await Notification.findById(notificationId);

        if (notification && notification.to.toString() === socket.userId) {
          notification.isRead = true;
          notification.readAt = new Date();
          await notification.save();

          // Send updated count
          const count = await Notification.countDocuments({
            to: socket.userId,
            isRead: false,
          });
          socket.emit('notification-count', count);
        }
      } catch (error) {
        console.error('❌ Error marking notification as read:', error);
      }
    });

    // Mark all as read
    socket.on('mark-all-read', async () => {
      try {
        const Notification = (await import('../models/notification.model.js')).default;
        await Notification.updateMany(
          { to: socket.userId, isRead: false },
          {
            isRead: true,
            readAt: new Date(),
          }
        );

        socket.emit('notification-count', 0);
      } catch (error) {
        console.error('❌ Error marking all as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ [Socket] Disconnected: ${socket.id}`);

      // Remove from userSockets map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`🗑️ [Socket] Removed mapping for user ${userId}`);
          break;
        }
      }
    });
  });

  console.log('✅ Socket.io server initialized');
  return io;
};

export const getSocketServer = () => {
  if (!io) {
    throw new Error('Socket.io server not initialized');
  }
  return io;
};

export const getUserSocket = userId => {
  const socketId = userSockets.get(String(userId));
  return socketId ? io.sockets.sockets.get(socketId) : null;
};
