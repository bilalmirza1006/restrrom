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

  // Determine the actual user ID (handle subscription manager role)
  let userId;
  if (user?.creatorId && user?.role === 'Subscription_Manager') {
    userId = user.creatorId;
  } else {
    userId = user._id;
  }

  console.log('[Get Current Subscription] User ID:', userId);

  // Find the most recent subscription for the user
  const subscription = await Subscriber.findOne({ user: userId })
    .populate('user')
    .sort({ createdAt: -1 }); // Get the most recent subscription

  if (!subscription) {
    return NextResponse.json(
      {
        success: true,
        data: null,
        message: 'No active subscription found',
      },
      { status: 200 }
    );
  }

  console.log('[Get Current Subscription] Found subscription:', subscription._id);

  return NextResponse.json({
    success: true,
    data: subscription,
  });
});
