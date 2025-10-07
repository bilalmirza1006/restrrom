import mongoose from 'mongoose';
import { imageSchema } from './global.model.js';

// ✅ severity schema (for color & fillColor arrays)
const severitySchema = new mongoose.Schema(
  {
    level: { type: String, required: true }, // none, low, medium, high
    min: { type: String, required: true },
    max: { type: String, required: true },
    color: { type: String, required: true },
  },
  { _id: false }
);

// ✅ point schema
const pointSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  { _id: true }
);

// ✅ buildingCoordinates schema
const buildingCoordinateSchema = new mongoose.Schema(
  {
    points: { type: [pointSchema], default: [] },
    id: { type: String, required: true },
    polygonId: { type: String },
    restroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'RestRoom' },
    restroomName: { type: String },
    labelPoint: { type: String },
    sensorAttached: { type: String },

    // arrays of severity objects
    color: { type: [severitySchema], default: [] },
    fillColor: { type: [severitySchema], default: [] },
  },
  { _id: false }
);

const buildingSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth' },
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
    inspectors: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Auth',
      default: [],
    },
    buildingCoordinates: { type: [buildingCoordinateSchema], default: [] },
  },
  { timestamps: true }
);

export const Building = mongoose.models.Building || mongoose.model('Building', buildingSchema);
