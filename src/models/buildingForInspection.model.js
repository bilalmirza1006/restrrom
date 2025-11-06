import mongoose from 'mongoose';
import { Building } from './building.model.js';
import { Auth } from './auth.model.js';

const buildingForInspectionSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth' },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building' },
    inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth' },
    inspectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection' },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Auto-populate building and inspector data
function autoPopulate(next) {
  this.populate({
    path: 'buildingId',
    model: 'Building',
  })
    .populate({
      path: 'inspectorId',
      model: 'Auth',
      select: 'name email role',
    })
    .populate({
      path: 'ownerId',
      model: 'Auth',
      select: 'name email role',
    });
  next();
}

buildingForInspectionSchema
  .pre('find', autoPopulate)
  .pre('findOne', autoPopulate)
  .pre('findById', autoPopulate);

export const BuildingForInspection =
  mongoose.models.BuildingForInspection ||
  mongoose.model('BuildingForInspection', buildingForInspectionSchema);
