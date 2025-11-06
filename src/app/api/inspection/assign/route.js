import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Building } from '@/models/building.model';
import { Auth } from '@/models/auth.model';
import { BuildingForInspection } from '@/models/buildingForInspection.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { NextResponse } from 'next/server';

export const POST = asyncHandler(async (req) => {
  await connectDb();

  const { user, accessToken } = await isAuthenticated();
  if (!user?._id) throw new customError(400, 'User not found');

  const { buildingId, inspectorId } = await req.json();

  if (!inspectorId) throw new customError(400, 'Please provide inspectorId');
  if (!buildingId) throw new customError(400, 'Please provide buildingId');

  // ✅ Verify building ownership
  const building = await Building.findOne({ _id: buildingId, ownerId: user._id });
  if (!building) throw new customError(400, 'You are not owner of this building');

  // ✅ Verify inspector exists and belongs to this creator
  const inspector = await Auth.findOne({
    _id: inspectorId,
    role: 'building_inspector',
    creatorId: user._id,
  });
  if (!inspector) throw new customError(400, 'Inspector not found or not authorized');

  // ✅ Check if already assigned
  const existingAssignment = await BuildingForInspection.findOne({
    buildingId,
    inspectorId,
  });
  if (existingAssignment) {
    throw new customError(400, 'This building is already assigned to this inspector');
  }

  // ✅ Create assignment
  const buildingForInspection = await BuildingForInspection.create({
    buildingId,
    inspectorId,
    ownerId: user._id,
    isCompleted: false,
  });

  if (!buildingForInspection)
    throw new customError(400, 'Failed to assign building for inspection');

  // ✅ Add buildingId to inspector.assignedBuildings
  await Auth.findByIdAndUpdate(
    inspectorId,
    { $addToSet: { assignedBuildings: buildingId } },
    { new: true }
  );

  // ✅ NEW: Add inspectorId to building.inspectors array
  await Building.findByIdAndUpdate(
    buildingId,
    { $addToSet: { inspectors: inspectorId } },
    { new: true }
  );

  // ✅ Populate full building data before sending response
  const populatedAssignment = await BuildingForInspection.findById(buildingForInspection._id)
    .populate('buildingId')
    .populate('inspectorId', 'name email role')
    .lean();

  return sendResponse(
    NextResponse,
    'Building assigned to inspector successfully',
    populatedAssignment,
    accessToken
  );
});
