import mongoose from 'mongoose';

const extraDetailsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const conditionEnum = ['excellent', 'good', 'malfunctioned', 'bad', 'not_checked'];

const restroomInspectionSchema = new mongoose.Schema(
  {
    restroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'RestRoom', required: true },
    restroomName: { type: String },
    cleanliness: { type: String, enum: conditionEnum, default: 'not_checked' },
    waterLeakage: { type: String, enum: conditionEnum, default: 'not_checked' },
    queuingStatus: { type: String, enum: conditionEnum, default: 'not_checked' },
    odorStatus: { type: String, enum: conditionEnum, default: 'not_checked' },
    lightingCondition: { type: String, enum: conditionEnum, default: 'not_checked' },
    suppliesAvailable: { type: Boolean, default: false },
    comments: { type: String },
    extraDetails: [extraDetailsSchema],
  },
  { _id: false }
);

const inspectionSchema = new mongoose.Schema(
  {
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true }, // ✅ added
    inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
    summary: { type: String, required: true },
    restroomInspections: { type: [restroomInspectionSchema], required: true },
  },
  { timestamps: true }
);

export const Inspection =
  mongoose.models.Inspection || mongoose.model('Inspection', inspectionSchema);
