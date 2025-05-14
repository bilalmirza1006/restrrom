const { default: mongoose } = require("mongoose");
const { imageSchema } = require("./global.model");

const buildingSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    buildingThumbnail: { type: imageSchema, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    area: { type: String, required: true },
    totalFloors: { type: Number, required: true },
    numberOfRooms: { type: Number, required: true },
    buildingManager: { type: String, required: true },
    phone: { type: String, required: true },
    buildingModelImage: { type: imageSchema, required: true },
    latitude: { type: String },
    longitude: { type: String },
    buildingCoordinates: {
      type: [
        {
          points: [{ x: Number, y: Number }],
          id: String,
          color: String,
          fillColor: String,
          labelPoint: String,
          sensorAttached: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Building = mongoose.models.Building || mongoose.model("Building", buildingSchema);
