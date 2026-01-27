'use client';

import { toast } from 'react-hot-toast';
import { getSocket } from '@/lib/socketClient';
import { useEffect } from 'react';

export const useSocketNotifications = ({ userId, onNotification, onCount }) => {
  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();
    socket.connect();

    socket.on('connect', () => {
      socket.emit('register', userId);
    });

    const handleNewNotification = data => {
      // Show Toast
      toast.success(data.message || 'New notification received!', {
        duration: 4000,
        position: 'top-right',
      });

      // Call original callback if provided
      if (onNotification) {
        onNotification(data);
      }
    };

    socket.on('new-notification', handleNewNotification);
    socket.on('notification-count', onCount);

    return () => {
      socket.off('new-notification', handleNewNotification);
      socket.off('notification-count', onCount);
      socket.disconnect();
    };
  }, [userId]);
};
