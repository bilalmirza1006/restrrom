import { connectDb } from '@/configs/connectDb';
import Subscriber from '@/models/subscription.model';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async (req) => {
  await connectDb();

  // Authenticate user
  const { user } = await isAuthenticated();

  // Check if user is admin (you can adjust this based on your role system)
  if (user.role !== 'admin' && user.role !== 'Admin') {
    throw new customError(403, 'Access denied. Admin role required.');
  }

  console.log('[Get All Subscribers] Admin user:', user._id);

  // Get all subscribers with populated user data
  const subscribers = await Subscriber.find({}).populate('user').sort({ createdAt: -1 });

  console.log('[Get All Subscribers] Found subscribers:', subscribers.length);

  return NextResponse.json({
    success: true,
    data: subscribers,
  });
});
