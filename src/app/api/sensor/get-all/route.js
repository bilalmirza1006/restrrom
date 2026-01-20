import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Sensor } from '@/models/sensor.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async () => {
  await connectDb();
  const { user, accessToken } = await isAuthenticated();
  let ownerId;

  if (user.role === 'admin') {
    ownerId = user._id;
  } else if (user.role === 'building_manager' || user.role === 'report_manager') {
    ownerId = user.creatorId;
  } else {
    ownerId = user._id;
  }

  const sensors = await Sensor.find({ ownerId });
  if (!sensors) throw new customError(400, 'No sensors found');
  return sendResponse(NextResponse, 'Sensors fetched successfully', sensors, accessToken);
});
