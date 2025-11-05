import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { BuildingForInspection } from '@/models/buildingForInspection.model';
import { Building } from '@/models/building.model';
import { Auth } from '@/models/auth.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { NextResponse } from 'next/server';

export const DELETE = asyncHandler(async (req) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  if (!user?._id) throw new customError(400, 'User not found');

  const { buildingId, inspectorId } = await req.json();

  if (!buildingId) throw new customError(400, 'Please provide buildingId');
  if (!inspectorId) throw new customError(400, 'Please provide inspectorId');

  // ✅ Verify ownership
  const building = await Building.findOne({ _id: buildingId, ownerId: user._id });
  if (!building) throw new customError(403, 'You are not the owner of this building');

  // ✅ Verify inspector is valid and belongs to same creator
  const inspector = await Auth.findOne({
    _id: inspectorId,
    role: 'building_inspector',
    creatorId: user._id,
  });
  if (!inspector) throw new customError(404, 'Inspector not found or not authorized');

  // ✅ Check existing assignment
  const assignment = await BuildingForInspection.findOne({
    buildingId,
    inspectorId,
  });
  if (!assignment) throw new customError(404, 'This building is not assigned to this inspector');

  // ✅ Remove the assignment record
  await BuildingForInspection.deleteOne({ _id: assignment._id });

  // ✅ Remove buildingId from inspector.assignedBuildings
  await Auth.findByIdAndUpdate(
    inspectorId,
    { $pull: { assignedBuildings: buildingId } },
    { new: true }
  );

  return sendResponse(
    NextResponse,
    'Building unassigned from inspector successfully',
    null,
    accessToken
  );
});
