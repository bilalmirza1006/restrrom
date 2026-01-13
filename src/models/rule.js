// models/rule.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const ruleSchema = new Schema({
  name: { type: String, required: true },

  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
  },

  ownerId: { type: String, required: true },
  buildingId: { type: String },
  restroomId: { type: String },
  stallId: { type: String },

  // Changed from single sensorId to array of sensorIds
  sensorIds: [{ type: String }],

  status: { type: String, enum: ['active', 'inactive'], default: 'active' },

  // New values object structure: { label, id, values }
  values: {
    label: { type: String },
    id: { type: String }, // potentially an identifier for the rule value
    value: Schema.Types.Mixed,
  },

  // Notification platform
  platform: { type: String, enum: ['email', 'platform'], required: true },
  email: { type: String },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Rule || mongoose.model('Rule', ruleSchema);
