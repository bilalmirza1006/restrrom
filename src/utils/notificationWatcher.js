import Notification from '../models/notification.model.js';
import { getUserSocket } from './socketHandler.js';
import { sendNotificationMail } from './sendMail.js';

// Helper: Get notification count
const getNotificationCount = async userId => {
  try {
    const count = await Notification.countDocuments({
      to: userId,
      isRead: false,
    });
    return count;
  } catch (err) {
    console.error('❌ Error getting notification count:', err.message);
    return 0;
  }
};

export const startNotificationWatcher = () => {
  console.log('[👁️ Notification Watcher] Starting...');

  // Use polling instead of MongoDB Change Streams for simplicity
  setInterval(async () => {
    try {
      // Check for unread notifications from last 2 seconds
      const twoSecondsAgo = new Date(Date.now() - 2000);

      const newNotifications = await Notification.find({
        isRead: false,
        createdAt: { $gte: twoSecondsAgo },
      }).populate('to sensorId');

      for (const notification of newNotifications) {
        const userId = notification.to._id.toString();

        // Send socket notification if platform is 'platform'
        if (notification.platform === 'platform') {
          const socket = getUserSocket(userId);
          if (socket) {
            socket.emit('new-notification', {
              ...notification.toObject(),
              _id: notification._id.toString(),
              to: userId,
              sensorId: notification.sensorId?._id?.toString(),
            });
            console.log(`📩 New notification sent to user ${userId}`);
          }
        }

        // Send email if platform is 'email' and email is provided
        if (notification.platform === 'email' && notification.onMail) {
          const success = await sendNotificationMail({
            to: notification.onMail,
            subject: `${notification.type.toUpperCase()} Alert`,
            severity: notification.severity,
            text: notification.message,
            userName: notification.to?.name || 'User',
            sensorId: notification.sensor_id || notification.sensorId?.sensorId,
            alertOrigin: 'Air Quality Monitoring System',
          });

          console.log(
            success.success
              ? `📧 Email sent to ${notification.onMail}`
              : `❌ Failed to send email to ${notification.onMail}`
          );
        }

        // Send updated notification count
        const socket = getUserSocket(userId);
        if (socket) {
          const count = await getNotificationCount(userId);
          socket.emit('notification-count', count);
          console.log(`🔢 Count updated for user ${userId}: ${count}`);
        }
      }
    } catch (err) {
      console.error('❌ Error in notification watcher:', err.message);
    }
  }, 2000); // Check every 2 seconds

  console.log('[👁️ Notification Watcher] Running...');
};

// Function to create notification
export const createNotification = async ({
  to,
  type,
  message,
  severity = 'low',
  platform = 'platform',
  sensorId,
  sensorData = {},
  immediate = false, // Send immediately via socket
}) => {
  try {
    const User = (await import('../models/auth.model.js')).default;
    const Sensor = (await import('../models/sensor.model.js')).default;

    // Get user details
    const user = await User.findById(to).select('email name');
    if (!user) throw new Error('User not found');

    // Get sensor details
    const sensor = await Sensor.findById(sensorId)
      .populate('buildingId floorId')
      .select('sensorId buildingId floorId location');

    // Create notification
    const notification = new Notification({
      to,
      type,
      message,
      severity,
      platform,
      onMail: platform === 'email' ? user.email : undefined,
      sensorId,
      sensor_building_id: sensor?.buildingId?._id,
      sensor_floor_id: sensor?.floorId?._id,
      sensor_id: sensor?.sensorId,
      metadata: {
        sensorType: sensor?.type,
        currentValue: sensorData.value,
        location: sensor?.location,
        alertType: type,
        ...sensorData,
      },
    });

    await notification.save();
    console.log(`✅ Notification created: ${type} for user ${to}`);

    // Send immediately if requested
    if (immediate && platform === 'platform') {
      const socket = getUserSocket(to);
      if (socket) {
        socket.emit('new-notification', {
          ...notification.toObject(),
          _id: notification._id.toString(),
        });
      }
    }

    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};

// Trigger sensor alert
export const triggerSensorAlert = async (sensorId, alertData) => {
  try {
    const Sensor = (await import('../models/sensor.model.js')).default;
    const Building = (await import('../models/building.model.js')).default;

    const sensor = await Sensor.findById(sensorId)
      .populate('buildingId userId')
      .select('sensorId name type threshold currentValue buildingId userId location');

    if (!sensor) {
      throw new Error('Sensor not found');
    }

    // Get building details
    const building = await Building.findById(sensor.buildingId).select('name adminId');

    // Determine alert message and severity
    let message = '';
    let severity = 'medium';

    if (alertData.value > sensor.threshold?.max) {
      message = `High ${sensor.type} alert: ${alertData.value} (threshold: ${sensor.threshold.max})`;
      severity = 'high';
    } else if (alertData.value < sensor.threshold?.min) {
      message = `Low ${sensor.type} alert: ${alertData.value} (threshold: ${sensor.threshold.min})`;
      severity = 'high';
    } else {
      message = `${sensor.type} is normal: ${alertData.value}`;
      severity = 'low';
    }

    const notifications = [];

    // 1. Notify sensor owner
    if (sensor.userId) {
      const notification = await createNotification({
        to: sensor.userId,
        type: 'sensor_alert',
        message,
        severity,
        platform: 'platform',
        sensorId,
        sensorData: {
          value: alertData.value,
          timestamp: new Date(),
          buildingName: building?.name,
          location: sensor.location,
        },
        immediate: true,
      });
      notifications.push(notification);
    }

    // 2. Notify building admin
    if (building?.adminId && building.adminId.toString() !== sensor.userId?.toString()) {
      const adminMessage = `${sensor.name} (${sensor.sensorId}) in ${building.name}: ${message}`;

      const notification = await createNotification({
        to: building.adminId,
        type: 'building_alert',
        message: adminMessage,
        severity,
        platform: 'email', // Send email to admin
        sensorId,
        sensorData: {
          buildingName: building.name,
          sensorName: sensor.name,
          value: alertData.value,
        },
      });
      notifications.push(notification);
    }

    // Update sensor
    sensor.currentValue = alertData.value;
    sensor.lastAlert = new Date();
    await sensor.save();

    console.log(`✅ Sensor alert triggered: ${sensor.sensorId}`);

    return notifications;
  } catch (error) {
    console.error('❌ Error triggering sensor alert:', error);
    throw error;
  }
};
