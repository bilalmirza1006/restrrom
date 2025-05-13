import mongoose from "mongoose";

const buildingForInspectionSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: "Building" },
    inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    inspectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Inspection" },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const BuildingForInspection =
  mongoose.models.BuildingForInspection || mongoose.model("BuildingForInspection", buildingForInspectionSchema);
