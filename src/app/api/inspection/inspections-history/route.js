import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Inspection } from '@/models/inspection.model';
import { Building } from '@/models/building.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async (req) => {
  await connectDb();

  // ✅ Authenticate user
  const { user, accessToken } = await isAuthenticated();
  if (!user?._id) throw new customError(400, 'User not found');

  // ✅ Get params (from query string)
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get('ownerId');
  const inspectorId = searchParams.get('inspectorId');

  if (!ownerId && !inspectorId) {
    throw new customError(400, 'Please provide either ownerId or inspectorId');
  }

  // ✅ Build query dynamically
  const query = {};
  if (ownerId) query.ownerId = ownerId;
  if (inspectorId) query.inspectorId = inspectorId;

  // ✅ Fetch inspections with building details populated
  const inspections = await Inspection.find(query)
    .populate({
      path: 'buildingId',
      model: Building,
    })
    .lean();

  if (!inspections?.length) throw new customError(404, 'No inspection history found');

  // ✅ Transform response to desired structure
  const formatted = inspections.map((item) => ({
    building: item.buildingId, // includes full building details
    summary: item.summary,
    restroomInspections: item.restroomInspections.map((r) => ({
      restroomId: r.restroomId?.toString(),
      restroomName: r.restroomName,
      cleanliness: r.cleanliness,
      waterLeakage: r.waterLeakage,
      queuingStatus: r.queuingStatus,
      odorStatus: r.odorStatus,
      lightingCondition: r.lightingCondition,
      suppliesAvailable: r.suppliesAvailable,
      extraDetails: r.extraDetails,
    })),
  }));

  return sendResponse(
    NextResponse,
    'Inspection history fetched successfully',
    formatted,
    accessToken
  );
});
