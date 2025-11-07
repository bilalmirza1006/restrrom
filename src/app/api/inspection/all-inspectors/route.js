// app/api/inspectors/route.js
import { connectDb } from '@/configs/connectDb';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { Auth } from '@/models/auth.model';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async req => {
  await connectDb();

  const { user, accessToken } = await isAuthenticated();
  if (!user?._id) throw new customError(400, 'User not found');

  // Get creatorId from query params or use current user ID
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get('creatorId') || user._id.toString();

  // Fetch all inspectors created by this creator
  const inspectors = await Auth.find({
    role: 'building_inspector',
    creatorId: creatorId,
  }).select('-password'); // Exclude password field

  return sendResponse(NextResponse, 'Inspectors fetched successfully', inspectors, accessToken);
});
