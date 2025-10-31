import { connectDb } from '@/configs/connectDb';
import { SubscriptionHistory } from '@/models/subscription.model';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async (req, { params }) => {
  await connectDb();

  // Authenticate user
  const { user } = await isAuthenticated();
  console.log('useruseruser', user._id);

  console.log('reqqqqqqqqqqq', req.body);

  // Get userId from params
  const { userId } = await params;
  console.log('userIduserIduserIduserId', userId);

  if (!userId) {
    throw new customError(400, 'User ID is required');
  }

  // Check if user is admin or accessing their own history
  const isAdmin = user.role === 'admin' || user.role === 'Admin';
  const isOwnHistory = String(user._id) === String(userId);

  if (!isAdmin && !isOwnHistory) {
    throw new customError(403, 'Access denied. You can only view your own subscription history.');
  }

  console.log('[Get Subscription History] User ID:', userId, 'Requested by:', user._id);

  // Get subscription history for the user
  const histories = await SubscriptionHistory.find({ user: userId }).sort({ createdAt: -1 });

  console.log('[Get Subscription History] Found history entries:', histories.length);

  return NextResponse.json({
    success: true,
    data: histories,
  });
});
