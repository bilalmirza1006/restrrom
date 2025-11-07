import { connectDb } from '@/configs/connectDb';
import { WebhookLog } from '@/models/subscription.model';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import { NextResponse } from 'next/server';

export const GET = asyncHandler(async req => {
  await connectDb();

  // Authenticate user
  const { user } = await isAuthenticated();

  // Check if user is admin
  if (user.role !== 'admin' && user.role !== 'Admin') {
    throw new customError(403, 'Access denied. Admin role required.');
  }

  console.log('[Get All Webhooks] Admin user:', user._id);

  // Get all webhook logs with limit
  const logs = await WebhookLog.find({}).sort({ createdAt: -1 }).limit(1000);

  console.log('[Get All Webhooks] Found webhook logs:', logs.length);

  return NextResponse.json({
    success: true,
    data: logs,
  });
});
