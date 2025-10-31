import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Building } from '@/models/building.model';
import { RestRoom } from '@/models/restroom.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async (req, { params }) => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  const { buildingId } = await params;

  if (!isValidObjectId(buildingId)) throw new customError(400, 'Invalid building id');

  const building = await Building.findOne({ _id: buildingId, ownerId: user?._id });
  if (!building) throw new customError(404, 'Building not found');

  const restrooms = await RestRoom.find({ buildingId });

  return sendResponse(
    NextResponse,
    'Building with restrooms fetched successfully',
    { building, restrooms },
    accessToken
  );
});
