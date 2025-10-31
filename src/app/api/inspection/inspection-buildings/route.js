import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { BuildingForInspection } from '@/models/buildingForInspection.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async (req) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  if (!user?._id) throw new customError(400, 'User not found');
  const buildings = await BuildingForInspection.find({ inspectorId: user?._id }).populate(
    'buildingId'
  );
  if (!buildings) throw new customError(400, 'Inspection not found');
  return sendResponse(NextResponse, '', buildings, accessToken);
});
