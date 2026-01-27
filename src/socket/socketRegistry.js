const userSockets = new Map();

export const addUserSocket = (userId, socket) => {
  userSockets.set(String(userId), socket);
};

export const removeUserSocket = socketId => {
  for (const [userId, socket] of userSockets.entries()) {
    if (socket.id === socketId) {
      userSockets.delete(userId);
      break;
    }
  }
};

export const getUserSocket = userId => {
  return userSockets.get(String(userId));
};
