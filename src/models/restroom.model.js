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
    modelCoordinates: { type: Array, required: true },
  },
  { timestamps: true }
);

export const RestRoom = mongoose.models.RestRoom || mongoose.model("RestRoom", restroomSchema);
