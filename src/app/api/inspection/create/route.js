// app/api/inspections/route.js
import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { BuildingForInspection } from '@/models/buildingForInspection.model';
import { Inspection } from '@/models/inspection.model';
import { Building } from '@/models/building.model';
import { RestRoom } from '@/models/restroom.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { NextResponse } from 'next/server';

export const POST = asyncHandler(async req => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  if (!user?._id) throw new customError(400, 'User not found');

  const body = await req.json();
  const { buildingId, restroomInspections = [], summary = '' } = body;

  if (!buildingId) throw new customError(400, 'Please provide buildingId');
  if (!restroomInspections?.length)
    throw new customError(400, 'Please provide at least one restroom inspection');

  // Verify assignment
  const isAssignedForInspection = await BuildingForInspection.findOne({
    buildingId,
    inspectorId: user._id,
    isCompleted: false,
  });

  if (!isAssignedForInspection) {
    throw new customError(
      400,
      'You are not assigned for this building or inspection already completed'
    );
  }

  // Get building and restroom details
  const building = await Building.findById(buildingId);
  if (!building) throw new customError(400, 'Building not found');

  const restroomIds = restroomInspections.map(insp => insp.restroomId);
  const validRestrooms = await RestRoom.find({
    _id: { $in: restroomIds },
    buildingId: buildingId,
  });

  if (validRestrooms.length !== restroomIds.length) {
    throw new customError(400, 'Some restrooms do not belong to this building');
  }

  // Add restroom names
  const restroomInspectionsWithNames = restroomInspections.map(inspection => {
    const restroom = validRestrooms.find(
      r => r._id.toString() === inspection.restroomId.toString()
    );
    return {
      ...inspection,
      restroomName: restroom?.name || 'Unknown',
    };
  });

  // ✅ Create inspection record with ownerId
  const inspection = await Inspection.create({
    ownerId: building.ownerId, // ✅ take ownerId from Building document
    inspectorId: user._id,
    buildingId,
    restroomInspections: restroomInspectionsWithNames,
    summary,
  });

  if (!inspection) throw new customError(400, 'Failed to create inspection record');

  // Mark assignment as completed
  await BuildingForInspection.updateOne(
    { _id: isAssignedForInspection._id },
    {
      $set: {
        isCompleted: true, // ✅ should be true after completion
        inspectionId: inspection._id,
      },
    }
  );

  return sendResponse(
    NextResponse,
    'Restroom inspection created successfully',
    inspection,
    accessToken
  );
});

// Get inspections for current inspector
export const GET = asyncHandler(async req => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  if (!user?._id) throw new customError(400, 'User not found');

  const inspections = await Inspection.find({ inspectorId: user._id })
    .populate('buildingId', 'name location type buildingManager phone')
    .populate('ownerId', 'fullName email')
    .populate('restroomInspections.restroomId', 'name type status area')
    .sort({ createdAt: -1 });

  return sendResponse(NextResponse, 'Inspections fetched successfully', inspections, accessToken);
});
