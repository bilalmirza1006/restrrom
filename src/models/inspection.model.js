// // // models/inspection.model.js - Updated version
// // import mongoose from 'mongoose';

// // const extraDetails = {
// //   title: { type: String, required: true },
// //   description: { type: String, required: true },
// //   _id: false,
// // };

// // const restroomInspection = {
// //   restroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'RestRoom' },
// //   restroomName: { type: String }, // For easy reference
// //   cleanliness: {
// //     type: String,
// //     enum: ['excellent', 'good', 'fair', 'poor'],
// //     required: true,
// //   },
// //   supplies: {
// //     type: String,
// //     enum: ['fully_stocked', 'partial', 'empty'],
// //     required: true,
// //   },
// //   functionality: {
// //     type: String,
// //     enum: ['fully_functional', 'partial', 'not_functional'],
// //     required: true,
// //   },
// //   waterLeakage: { type: Boolean, default: false },
// //   odorStatus: { type: Boolean, default: false },
// //   issues: { type: [String], default: [] },
// //   notes: { type: String, default: '' },
// //   images: { type: [String], default: [] }, // URLs of inspection photos
// //   extraDetails: { type: [extraDetails], default: [] },
// //   _id: false,
// // };

// // const inspectionsSchema = new mongoose.Schema(
// //   {
// //     ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth' },
// //     buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building' },
// //     inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth' },
// //     restroomInspections: { type: [restroomInspection], default: [] },
// //     overallStatus: {
// //       type: String,
// //       enum: ['pending', 'in_progress', 'completed', 'approved', 'rejected'],
// //       default: 'pending',
// //     },
// //     inspectionDate: { type: Date, default: Date.now },
// //     completedAt: { type: Date },
// //     summary: { type: String, default: '' }, // Overall inspection summary
// //   },
// //   { timestamps: true }
// // );

// // export const Inspection =
// //   mongoose.models.Inspection || mongoose.model('Inspection', inspectionsSchema);

// // models/inspection.model.js
// import mongoose from 'mongoose';

// // ✅ Subschema for extra dynamic fields (e.g. Mirror Cleanliness, Paper Towels)
// const extraDetailsSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     description: { type: String, required: true },
//   },
//   { _id: false }
// );

// // ✅ Subschema for each restroom inspection entry
// const restroomInspectionSchema = new mongoose.Schema(
//   {
//     restroomId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'RestRoom',
//       // required: true,
//     },
//     restroomName: { type: String, required: true },

//     // ✅ Qualitative inspection fields (string ratings)
//     cleanliness: {
//       type: String,
//       enum: ['excellent', 'good', 'fair', 'poor'],
//       // required: true,
//     },
//     supplies: {
//       type: String,
//       enum: ['fully_stocked', 'partial', 'empty'],
//       // required: true,
//     },
//     functionality: {
//       type: String,
//       enum: ['fully_functional', 'partial', 'not_functional'],
//       // required: true,
//     },

//     // ✅ Status fields — converted from Boolean → String (to avoid "Cast to Boolean" errors)
//     waterLeakage: {
//       type: String,
//       enum: ['none', 'minor', 'severe'],
//       default: 'none',
//     },
//     odorStatus: {
//       type: String,
//       enum: ['none', 'mild', 'strong'],
//       default: 'none',
//     },

//     // ✅ Optional info
//     issues: { type: [String], default: [] },
//     notes: { type: String, default: '' },
//     images: { type: [String], default: [] }, // image URLs
//     extraDetails: { type: [extraDetailsSchema], default: [] },
//   },
//   { _id: false }
// );

// // ✅ Main inspection schema
// const inspectionsSchema = new mongoose.Schema(
//   {
//     ownerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Auth',
//       required: true,
//     },
//     buildingId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Building',
//       required: true,
//     },
//     inspectorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Auth',
//       required: true,
//     },
//     restroomInspections: {
//       type: [restroomInspectionSchema],
//       required: true,
//     },
//     overallStatus: {
//       type: String,
//       enum: ['pending', 'in_progress', 'completed', 'approved', 'rejected'],
//       default: 'pending',
//     },
//     inspectionDate: { type: Date, default: Date.now },
//     completedAt: { type: Date },
//     summary: { type: String, default: '' },
//   },
//   { timestamps: true }
// );

// export const Inspection =
//   mongoose.models.Inspection || mongoose.model('Inspection', inspectionsSchema);
import mongoose from 'mongoose';

const extraDetailsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const conditionEnum = ['excellent', 'good', 'average', 'poor', 'bad', 'not_checked'];

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
