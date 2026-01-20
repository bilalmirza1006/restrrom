import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Building } from '@/models/building.model'; // ✅ ensures model is registered
import { BuildingForInspection } from '@/models/buildingForInspection.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async req => {
  await connectDb();

  const { user, accessToken } = await isAuthenticated();
  let ownerId;

  if (user.role === 'admin') {
    ownerId = user._id;
  } else if (user.role === 'building_manager') {
    ownerId = user.creatorId;
  } else {
    ownerId = user._id;
  }
  if (!user?._id) throw new customError(400, 'User not found');
  console.log('ownerownerIdId', ownerId);
  const inspections = await BuildingForInspection.find({ ownerId: ownerId })
    .sort({ createdAt: -1 })
    .lean();

  return sendResponse(
    NextResponse,
    'All assigned buildings fetched successfully',
    inspections,
    accessToken
  );
});
