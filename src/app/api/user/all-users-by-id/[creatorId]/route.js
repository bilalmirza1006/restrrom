// app/api/auth/all-users-by-id/[creatorId]/route.js

import { NextResponse } from 'next/server';
import { asyncHandler } from '@/utils/asyncHandler';
import { Auth } from '@/models/auth.model';
import { connectDb } from '@/configs/connectDb';
// import { sendResponse } from '@/utils/sendResponse'; // ✅ or default import, depending on your utils file
import customError from '@/utils/customError';
import sendResponse from '@/utils/sendResponse';

export const GET = asyncHandler(async (req, { params }) => {
  await connectDb();

  const { creatorId } = await params; // ✅ await params

  if (!creatorId) {
    throw new customError(400, 'Creator ID is required');
  }

  const users = await Auth.find({ creatorId }).select('-password');

  if (!users || users.length === 0) {
    return sendResponse(NextResponse, 'No users found for this creator', [], null);
  }

  return sendResponse(NextResponse, 'Users fetched successfully', users, null);
});
