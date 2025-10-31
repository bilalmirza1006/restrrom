import { connectDb } from '@/configs/connectDb';
import { WebhookLog } from '@/models/subscription.model';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async (req, { params }) => {
  await connectDb();

  // Authenticate user
  const { user } = await isAuthenticated();

  // Get userId from params
  const { userId } = params;

  if (!userId) {
    throw new customError(400, 'User ID is required');
  }

  // Check if user is admin or accessing their own webhooks
  const isAdmin = user.role === 'admin' || user.role === 'Admin';
  const isOwnWebhooks = String(user._id) === String(userId);

  if (!isAdmin && !isOwnWebhooks) {
    throw new customError(403, 'Access denied. You can only view your own webhook logs.');
  }

  console.log('[Get Webhooks by User] User ID:', userId, 'Requested by:', user._id);

  // Get webhook logs for the user
  const logs = await WebhookLog.find({ user: userId }).sort({ createdAt: -1 });

  console.log('[Get Webhooks by User] Found webhook logs:', logs.length);

  return NextResponse.json({
    success: true,
    data: logs,
  });
});
