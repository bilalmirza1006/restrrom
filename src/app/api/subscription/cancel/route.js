import { connectDb } from '@/configs/connectDb';
import { Auth } from '@/models/auth.model';
import Subscriber, { SubscriptionHistory } from '@/models/subscription.model';
import {
  cancelStripeSubscription,
  createSubscriptionHistory,
} from '@/lib/stripe/subscriptionService';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { asyncHandler } from '@/utils/asyncHandler';
import { customError } from '@/utils/customError';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export const POST = asyncHandler(async (req) => {
  await connectDb();

  // Authenticate user
  const { user } = await isAuthenticated();
  let userId = user?.creatorId && user?.role === 'Subscription_Manager' ? user.creatorId : user._id;

  console.log('[Cancel Subscription] User ID:', userId);

  // Parse body
  const body = await req.json();
  const { subscriptionId } = body;

  if (!subscriptionId) {
    throw new customError(400, 'Subscription ID is required');
  }

  // Find subscription in DB
  let subscription = await Subscriber.findOne({ stripeSubscriptionId: subscriptionId });

  if (!subscription && mongoose.Types.ObjectId.isValid(subscriptionId)) {
    subscription = await Subscriber.findById(subscriptionId);
  }

  if (!subscription) {
    subscription = await Subscriber.findOne({ user: userId }).sort({ createdAt: -1 });
  }

  if (!subscription) {
    throw new customError(404, 'Subscription not found');
  }

  console.log('[Cancel Subscription] Found subscription:', subscription._id);

  try {
    // Step 1: Delete subscription from MongoDB first
    // Step 1: Delete subscription from MongoDB
    await Subscriber.findByIdAndDelete(subscription._id);

    // Step 2: Remove subscriptionId from Auth
    // await Auth.findByIdAndUpdate(userId, { $unset: { subscriptionId: null } });
    await Auth.findByIdAndUpdate(userId, { subscriptionId: null });

    console.log('[Cancel Subscription] Deleted subscription + removed subscriptionId from Auth');

    // Step 3: Cancel in Stripe
    const stripeSubscription = await cancelStripeSubscription(subscription.stripeSubscriptionId);
    console.log('[Cancel Subscription] Stripe subscription canceled:', stripeSubscription.status);

    // Step 4: Log history (no `customer` or `event` here)
    await createSubscriptionHistory(userId, 'canceled', {
      plan: subscription.plan,
      priceAmount: subscription.priceAmount,
      priceCurrency: subscription.priceCurrency,
      status: 'canceled',
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    });

    console.log('[Cancel Subscription] Success: Subscription canceled');

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully',
      subscriptionStatus: stripeSubscription.status, // safer than hardcoding
    });
  } catch (error) {
    console.error('[Cancel Subscription] Error:', error);

    // If Stripe failed but Mongo deletion already happened, rollback Mongo
    if (subscription?._id) {
      await Subscriber.findByIdAndUpdate(subscription._id, subscription.toObject());
      await Auth.findByIdAndUpdate(userId, { subscriptionId: subscription._id });
      console.log('[Cancel Subscription] Rolled back MongoDB changes');
    }

    throw new customError(500, `Cancellation failed: ${error.message}`);
  }
});
