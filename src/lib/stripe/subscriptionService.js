import {
  stripe,
  stripeConfig,
  getPriceIdByPlan,
  getSubscriptionMode,
  safeDate,
} from '@/configs/stripe';
import Subscriber, { SubscriptionHistory } from '@/models/subscription.model';
import { Auth } from '@/models/auth.model';

/**
 * Create subscription data object for database
 * @param {Object} subscription - Stripe subscription object
 * @param {Object} customer - Stripe customer object
 * @returns {Object} Subscription data for database
 */
export const createSubscriptionData = (subscription, customer) => {
  const priceId = subscription.items?.data[0]?.price?.id;
  const plan = getPlanFromPriceId(priceId);

  const trialStartDate = safeDate(subscription.trial_start);
  const trialEndDate = trialStartDate
    ? new Date(trialStartDate.getTime() + stripeConfig.trialPeriodDays * 24 * 60 * 60 * 1000)
    : null;

  return {
    user: customer.metadata.userId,
    plan,
    stripeCustomerId: customer.id,
    stripeSubscriptionId: subscription.id,
    paymentMethod: [subscription.default_payment_method],
    priceId: priceId,
    subscriptionStatus: subscription.status,
    subscriptionStartDate: safeDate(subscription.current_period_start, new Date()),
    subscriptionEndDate:
      plan === 'lifetime'
        ? new Date('2099-12-31')
        : safeDate(subscription.current_period_end, new Date()),
    billingAddress: subscription.billing_details
      ? new Map(Object.entries(subscription.billing_details))
      : new Map(),
    isTrial: subscription.status === 'trial',
    trialStartDate,
    trialEndDate,
  };
};

/**
 * Get plan from price ID
 * @param {string} priceId - Stripe price ID
 * @returns {string} Plan name
 */
export const getPlanFromPriceId = priceId => {
  if (priceId === stripeConfig.monthlyPrice) return 'monthly';
  if (priceId === stripeConfig.yearlyPrice) return 'yearly';
  if (priceId === stripeConfig.lifetimePrice) return 'lifetime';
  return null;
};

/**
 * Create subscription history entry
 * @param {string} userId - User ID
 * @param {string} action - Action type
 * @param {Object} options - Additional options
 */
export const createSubscriptionHistory = async (userId, action, options = {}) => {
  try {
    await SubscriptionHistory.create({
      user: userId,
      action,
      plan: options.plan || null,
      priceAmount: options.priceAmount || null, // ✅ pull from options
      priceCurrency: options.priceCurrency || null, // ✅ pull from options
      stripeCustomerId: options.stripeCustomerId || null,
      stripeSubscriptionId: options.stripeSubscriptionId || null,
      status: options.status || null,
      note: options.note || null,
      metadata: options.metadata || {},
    });
  } catch (error) {
    console.error('[Subscription] Failed to create history entry:', error);
  }
};

/**
 * Update user subscription reference
 * @param {string} userId - User ID
 * @param {string} subscriptionId - Subscription ID
 * @param {boolean} isTrialDone - Whether trial is done
 */
export const updateUserSubscription = async (userId, subscriptionId, isTrialDone = true) => {
  try {
    const updatedUser = await Auth.findByIdAndUpdate(
      userId,
      {
        subscriptionId,
        isTrialDone,
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('User not found for subscription update');
    }

    return updatedUser;
  } catch (error) {
    console.error('[Subscription] Failed to update user subscription:', error);
    throw error;
  }
};

/**
 * Cancel subscription in Stripe (force immediate cancel)
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Object} Updated Stripe subscription
 */
export const cancelStripeSubscription = async subscriptionId => {
  // 1️⃣ Fetch subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // 2️⃣ If already canceled, return it
  if (subscription.status === 'canceled') {
    console.log('[Cancel Subscription] Stripe: Already canceled');
    return subscription;
  }

  // 3️⃣ Always cancel immediately
  return await stripe.subscriptions.cancel(subscriptionId);
};

/**
 * Update subscription in database
 * @param {string} subscriptionId - Database subscription ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated subscription
 */
export const updateSubscriptionInDb = async (subscriptionId, updateData) => {
  try {
    const updatedSubscription = await Subscriber.findByIdAndUpdate(subscriptionId, updateData, {
      new: true,
    });

    if (!updatedSubscription) {
      throw new Error('Subscription not found for update');
    }

    return updatedSubscription;
  } catch (error) {
    console.error('[Subscription] Failed to update subscription in DB:', error);
    throw error;
  }
};
