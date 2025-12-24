// models/rule.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const valueRangeSchema = new Schema({
  min: { type: Number },
  max: { type: Number },
  booleanValue: { type: Boolean }, // for boolean sensors like occupancy or waterLeakage
  stringValue: { type: String }, // for string sensors like doorQueue event or soapDispenser status
});

const ruleSchema = new Schema({
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

  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
  },

  ownerId: { type: String, required: true },
  buildingId: { type: String },
  restroomId: { type: String },
  stallId: { type: String },
  sensorId: { type: String }, // optional, specific sensor rule

  status: { type: String, enum: ['active', 'inactive'], default: 'active' },

  // Sensor-specific value thresholds or conditions
  valueRange: valueRangeSchema,

  // Optional: for complex rules like multiple conditions or multiple fields
  conditions: [
    {
      field: { type: String }, // e.g., 'pm2_5', 'occupied', 'level'
      operator: { type: String }, // e.g., '>', '<', '=', '!=', 'between'
      value: Schema.Types.Mixed, // number, boolean, string depending on field
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Rule || mongoose.model('Rule', ruleSchema);
