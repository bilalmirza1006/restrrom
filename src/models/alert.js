// models/alert.js
import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  alertType: {
    type: String,
    enum: [
      'occupancy',
      'waterLeakage',
      'airQuality',
      'toiletPaper',
      'soapDispenser',
      'doorQueue',
      'stallStatus',
    ],
    required: true,
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  label: { type: String }, // label for the alert condition
  value: { type: mongoose.Schema.Types.Mixed }, // could be number, boolean, or string
  sensorId: { type: String }, // optional reference
  platform: { type: String, enum: ['email', 'platform'], required: true }, // added
  email: { type: String }, // optional email
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  ownerId: { type: String, required: true }, // optional, store user id
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Alert || mongoose.model('Alert', alertSchema);
