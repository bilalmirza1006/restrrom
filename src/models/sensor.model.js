const { default: mongoose } = require('mongoose');

const sensorSchema = new mongoose.Schema(
  {
    // Common Identifiers
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building' },
    restroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'RestRoom' },
    stallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stall' }, // Previously 'slateId'

    // Common Fields
    name: { type: String, required: true },
    uniqueId: { type: String, required: true },
    isConnected: { type: Boolean, required: true, default: false },
    status: { type: Boolean, default: false },
    // battery: { type: String }, // For battery health if applicable

    // Sensor Type
    sensorType: {
      type: String,
      required: true,
      enum: [
        'door_queue',
        'stall_status',
        'occupancy',
        'air_quality',
        'toilet_paper',
        'soap_dispenser',
        'water_leakage',
      ],
    },
  },
  { timestamps: true }
);

export const Sensor = mongoose.models.Sensor || mongoose.model('Sensor', sensorSchema);
