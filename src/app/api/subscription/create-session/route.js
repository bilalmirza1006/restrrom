import { connectDb } from '@/configs/connectDb';
import { Auth } from '@/models/auth.model';
import { stripe, stripeConfig, getPriceIdByPlan, getSubscriptionMode } from '@/configs/stripe';
import {
  findOrCreateCustomer,
  getActiveSubscription,
  createBillingPortalSession,
} from '@/lib/stripe/customerService';
import { isAuthenticated } from '@/lib/isAuthenticated';
import { asyncHandler } from '@/utils/asyncHandler';
import customError from '@/utils/customError';
import { NextResponse } from 'next/server';

export const POST = asyncHandler(async (req) => {
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

  console.log('[Create Session] User ID:', userId);

  // Get user from database
  const userDoc = await Auth.findById(userId);
  if (!userDoc) {
    throw new customError(404, 'User not found');
  }

  // Get plan from request body
  const body = await req.json();
  const { plan } = body;

  if (!plan || !['monthly', 'yearly', 'lifetime'].includes(plan)) {
    throw new customError(400, 'Please select a valid subscription plan');
  }

  console.log('[Create Session] Plan:', plan);

  // Get price ID and subscription mode
  const priceId = getPriceIdByPlan(plan);
  const subscriptionMode = getSubscriptionMode(plan);

  console.log('[Create Session] Subscription mode:', subscriptionMode);

  // Find or create customer
  const customer = await findOrCreateCustomer(userDoc, plan);

  // Check if customer has active subscription
  const activeSubscription = await getActiveSubscription(customer.id);

  if (activeSubscription) {
    console.log('[Create Session] Customer has active subscription, redirecting to billing portal');

    const billingPortalSession = await createBillingPortalSession(customer.id);

    return NextResponse.json({
      success: true,
      redirect_url: billingPortalSession.url,
    });
  }

  // Create checkout session payload
  const sessionPayload = {
    success_url: stripeConfig.successUrl,
    cancel_url: stripeConfig.cancelUrl,
    payment_method_types: ['card'],
    mode: subscriptionMode,
    billing_address_collection: 'auto',
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      userId: String(userId),
      plan,
      website: stripeConfig.website,
    },
    customer: customer.id,
  };

  // Add subscription data for subscription mode
  if (subscriptionMode === 'subscription') {
    sessionPayload.subscription_data = {};

    // Add trial period if user hasn't used trial
    if (!userDoc?.isTrialDone) {
      console.log('[Create Session] Adding trial period');
      sessionPayload.subscription_data.trial_period_days = stripeConfig.trialPeriodDays;
    }
  }

  console.log('[Create Session] Session payload:', sessionPayload);

  // Create checkout session
  const session = await stripe.checkout.sessions.create(sessionPayload);

  console.log('[Create Session] Session created:', session.id);

  return NextResponse.json({
    success: true,
    sessionId: session.id,
  });
});
