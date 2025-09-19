import { getEnv } from './config.js';
import Stripe from 'stripe';

// Initialize Stripe
export const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'));

// Stripe configuration constants
export const stripeConfig = {
  // Price IDs - Update these with your actual Stripe price IDs
  monthlyPrice: 'price_1RtRrdIvRUTQBOxaElD7rMOr',
  yearlyPrice: 'price_1RtSKmIvRUTQBOxahzPBw0WH',
  lifetimePrice: 'price_1RuqUHIvRUTQBOxaNFpQ9cCh',

  // URLs
  successUrl: getEnv('SUBSCRIPTION_SUCCESS_URL'),
  cancelUrl: getEnv('SUBSCRIPTION_CANCEL_URL'),
  returnUrl: getEnv('SUBSCRIPTION_RETURN_URL'),

  // Trial period
  trialPeriodDays: parseInt(getEnv('SUBSCRIPTION_TRIAL_PERIOD_DAYS')) || 7,

  // Webhook secret
  webhookSecret: getEnv('STRIPE_WEBHOOK_SECRET'),

  // Website identifier
  website: 'air_quality',
};

// Helper function to get price ID by plan
export const getPriceIdByPlan = (plan) => {
  switch (plan) {
    case 'monthly':
      return stripeConfig.monthlyPrice;
    case 'yearly':
      return stripeConfig.yearlyPrice;
    case 'lifetime':
      return stripeConfig.lifetimePrice;
    default:
      throw new Error(`Invalid plan: ${plan}`);
  }
};

// Helper function to get subscription mode by plan
export const getSubscriptionMode = (plan) => {
  return plan === 'lifetime' ? 'payment' : 'subscription';
};

// Helper function to safely convert Stripe timestamps
export const safeDate = (timestamp, fallback = null) => {
  if (!timestamp || isNaN(timestamp)) return fallback;
  const d = new Date(timestamp * 1000);
  return isNaN(d.getTime()) ? fallback : d;
};
