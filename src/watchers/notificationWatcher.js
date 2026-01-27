import Notification from '../models/notification.model.js';
import { getUserSocket } from '../socket/socketRegistry.js';
import { sendNotificationMail } from '../utils/sendMail.js';

const getUnreadCount = async userId => {
  return Notification.countDocuments({
    to: userId,
    isRead: false,
  });
};

export const startNotificationWatcher = () => {
  const stream = Notification.watch();

  console.log('👁️ Notification watcher started');

  stream.on('change', async change => {
    try {
      let userId;

      // INSERT
      if (change.operationType === 'insert') {
        const doc = change.fullDocument;
        userId = doc.to;

        // 🔔 Socket
        if (doc.platform === 'platform') {
          console.log(`📡 Sending socket notification to user: ${userId}`);
          const socket = getUserSocket(userId);
          if (socket) {
            socket.emit('new-notification', doc);
          } else {
            console.log(`⚠️ No active socket found for user: ${userId}`);
          }
        }

        // 📧 Email
        if (doc.platform === 'email' && doc.onMail) {
          console.log(`📧 Sending email notification to: ${doc.onMail}`);
          await sendNotificationMail({
            to: doc.onMail,
            subject: doc.type,
            text: doc.message,
            severity: doc.severity,
            userName: doc.userName,
            sensorId: doc.sensor_id,
            alertOrigin: doc.alert_source,
          });
        }
      }

      // UPDATE / READ
      if (change.operationType === 'update' || change.operationType === 'replace') {
        const updated = await Notification.findById(change.documentKey._id);
        userId = updated?.to;
      }

      // 🔢 Update count
      if (userId) {
        const socket = getUserSocket(userId);
        const count = await getUnreadCount(userId);
        socket?.emit('notification-count', count);
      }
    } catch (err) {
      console.error('❌ Notification watcher error:', err.message);
    }
  });
};
