import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Building } from '@/models/building.model';
import { BuildingForInspection } from '@/models/buildingForInspection.model';
import { asyncHandler } from '@/utils/asyncHandler';
import sendResponse from '@/utils/sendResponse';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async req => {
  await connectDb();

  const { user, accessToken } = await isAuthenticated();

  let buildings = [];

  // 🔹 Inspector logic (keep as it is)
  if (user.role === 'inspector') {
    const data = await BuildingForInspection.find({
      inspectorId: user._id,
    }).populate('buildingId');

    if (data?.length) {
      buildings = data.map(item => item?.buildingId).filter(Boolean);
    }
  } else {
    // 🔹 Determine ownerId based on role
    let ownerId = user._id;

    if (user.role === 'building_manager') {
      ownerId = user.creatorId;
    }
    if (user.role === 'report_manager') {
      ownerId = user.creatorId;
    }

    if (user.role === 'admin') {
      ownerId = user._id;
    }
    console.log('ownerIdownerId', ownerId);

    buildings = await Building.find({ ownerId });
  }

  return sendResponse(NextResponse, 'Buildings fetched successfully', buildings, accessToken);
});
