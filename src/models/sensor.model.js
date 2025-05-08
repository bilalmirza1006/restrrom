const { default: mongoose } = require("mongoose");

const sensorSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    uniqueId: { type: String, required: true },
    isConnected: { type: Boolean, required: true, default: false },
    status: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const Sensor =
  mongoose.models.Sensor || mongoose.model("Sensor", sensorSchema);
