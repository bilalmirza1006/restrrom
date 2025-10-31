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
  const ownerId = user._id;
  const sensors = await Sensor.find({ ownerId });
  if (!sensors) throw new customError(400, 'No sensors found');
  return sendResponse(NextResponse, 'Sensors fetched successfully', sensors, accessToken);
});
