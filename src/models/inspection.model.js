import mongoose from "mongoose";

const extraDetails = {
  title: { type: String, required: true },
  description: { type: String, required: true },
  _id: false,
};

const inspections = {
  floorId: { type: mongoose.Schema.Types.ObjectId, ref: "Floor" },
  waterLeakage: { type: Boolean, default: false },
  odorStatus: { type: Boolean, default: false },
  extraDetails: { type: [extraDetails], default: [] },
  _id: false,
};
const inspectionsSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: "Building" },
    inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    inspections: { type: [inspections], default: [] },
  },
  { timestamps: true }
);

export const Inspection = mongoose.models.Inspections || mongoose.model("Inspection", inspectionsSchema);
