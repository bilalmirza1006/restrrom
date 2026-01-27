import { Schema, Types, model } from 'mongoose';

const notificationSchema = new Schema(
  {
    to: { type: Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    platform: {
      type: String,
      enum: ['platform', 'email'],
      required: true,
    },
    onMail: { type: String },
    sensorId: { type: Types.ObjectId, ref: 'Sensor', required: true },
    sensor_building_id: { type: Types.ObjectId, ref: 'Building' },
    sensor_restroom_id: { type: Types.ObjectId, ref: 'RestRoom' },
    sensor_id: { type: String },
    readAt: { type: Date, default: null },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
notificationSchema.index({ to: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ sensorId: 1 });

const Notification = model('Notification', notificationSchema);
export default Notification;
