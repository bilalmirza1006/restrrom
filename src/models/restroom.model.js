import mongoose from "mongoose";
import { imageSchema } from "./global.model.js";

const restroomSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: "Building" },
    name: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, required: true },
    area: { type: String, required: true },
    numOfToilets: { type: Number, required: true },
    modelImage: { type: [imageSchema], required: true },
    modelCoordinates: {
      type: [
        {
          points: { type: Array, required: true },
          sensor: { type: mongoose.Schema.Types.ObjectId, ref: "Sensor" },
          id: { type: String, required: true },
          color: { type: String, required: true },
          fillColor: { type: String, required: true },
          labelPoint: { type: String, required: true },
        },
      ],
      default: [],
      _id: false,
    },
    sensors: { type: [mongoose.Schema.Types.ObjectId], ref: "Sensor", default: [] },
  },
  { timestamps: true }
);

export const RestRoom = mongoose.models.RestRoom || mongoose.model("RestRoom", restroomSchema);
