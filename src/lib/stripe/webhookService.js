import { stripe, stripeConfig, safeDate } from '@/configs/stripe';
import Subscriber, { SubscriptionHistory, WebhookLog } from '@/models/subscription.model';
import { Auth } from '@/models/auth.model';
import {
  createSubscriptionData,
  createSubscriptionHistory,
  updateUserSubscription,
  getPlanFromPriceId,
} from './subscriptionService';

/**
 * Log webhook event to database
 * @param {Object} event - Stripe webhook event
 * @param {Object} headers - Request headers
 * @returns {string} Webhook log ID
 */
export const logWebhookEvent = async (event, headers) => {
  try {
    console.log('[Webhook] logWebhookEvent start', { type: event?.type, id: event?.id });
    const eventObj = event.data?.object || {};
    const maybeUserId = eventObj?.metadata?.userId || null;
    const maybeCustomerId = eventObj?.customer || eventObj?.customer_id || null;
    const maybeSubscriptionId = eventObj?.subscription || eventObj?.id || null;

    const webhookLog = await WebhookLog.create({
      eventId: event.id,
      eventType: event.type,
      payload: event,
      headers,
      stripeCustomerId: maybeCustomerId,
      stripeSubscriptionId: maybeSubscriptionId,
      user: maybeUserId || null,
      processed: false,
    });

    console.log('[Webhook] Logged event to DB:', webhookLog._id);
    return webhookLog._id;
  } catch (error) {
    console.error('[Webhook] Failed to log event:', error);
    return null;
  }
};

/**
 * Mark webhook as processed
 * @param {string} webhookLogId - Webhook log ID
 * @param {string} userId - User ID (optional)
 */
export const markWebhookProcessed = async (webhookLogId, userId = null) => {
  try {
    if (webhookLogId) {
      console.log('[Webhook] Marking webhook processed', { webhookLogId, userId });
      await WebhookLog.findByIdAndUpdate(webhookLogId, {
        processed: true,
        user: userId,
      });
    }
  } catch (error) {
    console.error('[Webhook] Failed to mark as processed:', error);
  }
};

/**
 * Handle subscription events
 * @param {Object} event - Stripe webhook event
 * @param {string} webhookLogId - Webhook log ID
 * @returns {Object} Result object
 */
export const handleSubscriptionEvent = async (event, webhookLogId) => {
  const subscription = event.data.object;
  console.log('[Webhook] Processing subscription event:', {
    id: subscription.id,
    status: subscription.status,
    customer: subscription.customer,
  });

  // Get customer details
  let customer;
  try {
    customer = await stripe.customers.retrieve(subscription.customer);
    console.log('[Webhook] Customer retrieved:', {
      id: customer.id,
      email: customer.email,
      metadata: customer.metadata,
    });
  } catch (error) {
    console.error('[Webhook] Error retrieving customer:', error);
    throw new Error('Customer not found');
  }

  if (!customer) {
    throw new Error('Customer not found');
  }

  // Update webhook log with customer/user
  await markWebhookProcessed(webhookLogId, customer.metadata?.userId);

  // Validate website metadata
  if (customer?.metadata?.website !== stripeConfig.website) {
    console.error('[Webhook] Website metadata mismatch:', {
      expected: stripeConfig.website,
      actual: customer?.metadata?.website,
    });
    throw new Error('Website metadata not found in subscription');
  }

  // Event handlers
  const eventHandlers = {
    'customer.subscription.created': async () => {
      console.log('[Webhook] Handling subscription created');

      // Check if subscription already exists
      const existingSubscription = await Subscriber.findOne({
        stripeSubscriptionId: subscription.id,
      });
      console.log('[Webhook] existingSubscription lookup by id', !!existingSubscription);

      if (existingSubscription) {
        console.log('[Webhook] Subscription already exists, skipping creation');
        await createSubscriptionHistory(customer.metadata.userId, 'created', {
          note: 'customer.subscription.created received but subscription already exists',
          metadata: { eventId: event.id },
        });
        return { message: 'Subscription Already Exists' };
      }

      // Check if customer already has an active subscription
      const existingCustomerSubscription = await Subscriber.findOne({
        stripeCustomerId: customer.id,
        subscriptionStatus: { $in: ['active', 'trialing', 'past_due'] },
      });
      console.log(
        '[Webhook] existingCustomerSubscription lookup by customer',
        !!existingCustomerSubscription
      );

      if (existingCustomerSubscription) {
        console.log('[Webhook] Customer already has active subscription, updating existing one');

        const subscriptionData = createSubscriptionData(subscription, customer);
        const updateResult = await Subscriber.updateOne(
          { _id: existingCustomerSubscription._id },
          {
            ...subscriptionData,
            stripeSubscriptionId: subscription.id,
          }
        );

        await updateUserSubscription(
          customer.metadata.userId,
          existingCustomerSubscription._id,
          true
        );

        await createSubscriptionHistory(customer.metadata.userId, 'updated', {
          metadata: { reason: 'existingCustomerSubscription found and updated' },
        });

        return { message: 'Existing Subscription Updated' };
      }

      // Create new subscription
      const subscriptionData = createSubscriptionData(subscription, customer);
      console.log('[Webhook] Creating new subscription with data snippet', {
        user: subscriptionData.user,
        plan: subscriptionData.plan,
        stripeCustomerId: subscriptionData.stripeCustomerId,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        status: subscriptionData.subscriptionStatus,
        subscriptionData: subscriptionData,
      });

      const priceObj = subscription.items?.data[0]?.price || {};
      subscriptionData.priceAmount = priceObj.unit_amount ? priceObj.unit_amount / 100 : null;
      subscriptionData.priceCurrency = priceObj.currency || null;

      const newSubscription = await Subscriber.create(subscriptionData);

      await createSubscriptionHistory(customer.metadata.userId, 'created', {
        plan: subscriptionData.plan,
        status: subscriptionData.subscriptionStatus,
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        priceAmount: subscriptionData.priceAmount, // ✅ added
        priceCurrency: subscriptionData.priceCurrency, // ✅ added
        metadata: { eventId: event.id },
      });
      await updateUserSubscription(customer.metadata.userId, newSubscription._id, true);

      // await createSubscriptionHistory(customer.metadata.userId, 'created', {
      //   plan: subscriptionData.plan, // <--- FIXED
      //   status: subscriptionData.subscriptionStatus,
      //   stripeCustomerId: customer.id,
      //   stripeSubscriptionId: subscription.id,
      //   metadata: { eventId: event.id },
      //   priceAmount: subscriptionData.priceAmount,
      //   priceCurrency: subscriptionData.priceCurrency,
      // });

      return { message: 'Subscription Created' };
    },

    'customer.subscription.updated': async () => {
      console.log('[Webhook] Handling subscription updated');

      // Get price details from subscription
      const priceObj = subscription.items?.data[0]?.price || {};
      const plan = getPlanFromPriceId(priceObj.id);

      console.log('[Webhook] Update event plan resolved', {
        priceId: priceObj.id,
        plan,
        amount: priceObj.unit_amount ? priceObj.unit_amount / 100 : null,
        currency: priceObj.currency,
      });

      const updateData = {
        plan,
        priceId: priceObj.id || null,
        priceAmount: priceObj.unit_amount ? priceObj.unit_amount / 100 : null, // ✅
        priceCurrency: priceObj.currency || null, // ✅
        subscriptionStatus: subscription.status,
        subscriptionStartDate: safeDate(subscription.current_period_start, new Date()),
        subscriptionEndDate:
          plan === 'lifetime'
            ? new Date('2099-12-31')
            : safeDate(subscription.current_period_end, new Date()),
        paymentMethod: [subscription.default_payment_method],
        isTrial: subscription.status === 'trialing',
      };

      if (subscription.cancel_at_period_end) {
        updateData.subscriptionStatus = 'canceled';
      }

      // Update by stripeSubscriptionId first, then by stripeCustomerId as fallback
      let updateResult = await Subscriber.updateOne(
        { stripeSubscriptionId: subscription.id },
        updateData
      );
      console.log('[Webhook] Update by subscription.id matchedCount', updateResult?.matchedCount);

      if (updateResult.matchedCount === 0) {
        updateResult = await Subscriber.updateOne({ stripeCustomerId: customer.id }, updateData);
        console.log('[Webhook] Update by customer.id matchedCount', updateResult?.matchedCount);
      }

      await createSubscriptionHistory(customer.metadata.userId, 'updated', {
        plan,
        priceAmount: updateData.priceAmount, // ✅ now correctly set
        priceCurrency: updateData.priceCurrency, // ✅ now correctly set
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        metadata: { updateResult },
      });

      return { message: 'Subscription Updated' };
    },

    'customer.subscription.deleted': async () => {
      console.log('[Webhook] Handling subscription deleted');

      // Find subscription by subscription ID first, then by customer ID
      let subscriptionToDelete = await Subscriber.findOne({
        stripeSubscriptionId: subscription.id,
      });
      console.log('[Webhook] Delete find by subscription.id', !!subscriptionToDelete);

      if (!subscriptionToDelete) {
        subscriptionToDelete = await Subscriber.findOne({
          stripeCustomerId: customer.id,
        });
        console.log('[Webhook] Delete find by customer.id', !!subscriptionToDelete);
      }

      if (!subscriptionToDelete) {
        console.log('[Webhook] No subscription found to delete');
        await createSubscriptionHistory(customer.metadata.userId, 'deleted', {
          note: 'delete event received but no subscription doc existed',
          metadata: { eventId: event.id },
        });
        return { message: 'No Subscription Found to Delete' };
      }

      const [deleteResult, updatedUser] = await Promise.all([
        Subscriber.deleteOne({ _id: subscriptionToDelete._id }),
        Auth.findByIdAndUpdate(customer.metadata.userId, { subscriptionId: null }, { new: true }),
      ]);

      await createSubscriptionHistory(customer.metadata.userId, 'deleted', {
        stripeSubscriptionId: subscription.id,
        metadata: { deleteResult },
      });

      return { message: 'Subscription Deleted' };
    },

    'customer.subscription.paused': async () => {
      console.log('[Webhook] Handling subscription paused');
      const updateResult = await Subscriber.updateOne(
        { stripeSubscriptionId: subscription.id },
        { subscriptionStatus: subscription.status }
      );

      await createSubscriptionHistory(customer.metadata.userId, 'paused', {
        stripeSubscriptionId: subscription.id,
        metadata: { updateResult },
      });

      return { message: 'Subscription Paused' };
    },

    'customer.subscription.resumed': async () => {
      console.log('[Webhook] Handling subscription resumed');
      const updateResult = await Subscriber.updateOne(
        { stripeSubscriptionId: subscription.id },
        { subscriptionStatus: subscription.status }
      );

      await createSubscriptionHistory(customer.metadata.userId, 'resumed', {
        stripeSubscriptionId: subscription.id,
        metadata: { updateResult },
      });

      return { message: 'Subscription Resumed' };
    },

    'customer.subscription.trial_will_end': async () => {
      console.log('[Webhook] Handling trial will end');
      const updateResult = await Subscriber.updateOne(
        { stripeSubscriptionId: subscription.id },
        {
          subscriptionStatus: subscription.status,
          trialStartDate: null,
          trialEndDate: null,
          isTrial: false,
        }
      );

      await createSubscriptionHistory(customer.metadata.userId, 'trial_ended', {
        stripeSubscriptionId: subscription.id,
        metadata: { updateResult },
      });

      return { message: 'Trial Ended, Subscription Resumed' };
    },
  };

  const handler = eventHandlers[event.type];
  if (handler) {
    return await handler();
  }

  console.log('[Webhook] Unhandled subscription event type:', event.type);
  return { message: 'Subscription event received but not processed' };
};

/**
 * Handle invoice events
 * @param {Object} event - Stripe webhook event
 * @param {string} webhookLogId - Webhook log ID
 * @returns {Object} Result object
 */
export const handleInvoiceEvent = async (event, webhookLogId) => {
  const invoice = event.data.object;
  console.log('[Webhook] Processing invoice event:', {
    id: invoice.id,
    status: invoice.status,
    subscription: invoice.subscription,
  });

  if (invoice.subscription) {
    try {
      const updateResult = await Subscriber.updateOne(
        { stripeSubscriptionId: invoice.subscription },
        { subscriptionStatus: 'active' }
      );
      console.log(
        '[Webhook] invoice.payment_succeeded update matchedCount',
        updateResult?.matchedCount
      );

      // Create history entry for invoice payment
      const subDoc = await Subscriber.findOne({ stripeSubscriptionId: invoice.subscription });
      if (subDoc) {
        await createSubscriptionHistory(subDoc.user, 'renewed', {
          plan: subDoc.plan,
          stripeCustomerId: subDoc.stripeCustomerId,
          stripeSubscriptionId: invoice.subscription,
          priceAmount: invoice.amount_paid ? invoice.amount_paid / 100 : null, // ✅ added
          priceCurrency: invoice.currency || null,
          metadata: { invoiceId: invoice.id },
        });
      }

      await markWebhookProcessed(webhookLogId);
      return { message: 'Invoice Payment Succeeded' };
    } catch (error) {
      console.error('[Webhook] Error updating subscription from invoice:', error);
      throw error;
    }
  }

  await markWebhookProcessed(webhookLogId);
  return { message: 'Invoice event received but no subscription found' };
};

/**
 * Handle checkout session events
 * @param {Object} event - Stripe webhook event
 * @param {string} webhookLogId - Webhook log ID
 * @returns {Object} Result object
 */
export const handleCheckoutEvent = async (event, webhookLogId) => {
  const session = event.data.object;
  console.log('[Webhook] Processing checkout session event:', {
    id: session.id,
    status: session.status,
    subscription: session.subscription,
    mode: session.mode,
    metadata: session.metadata,
  });

  // Handle lifetime subscriptions (one-time payments)
  if (session.mode === 'payment' && session.metadata?.plan === 'lifetime') {
    console.log('[Webhook] Processing lifetime subscription checkout');

    try {
      const customer = await stripe.customers.retrieve(session.customer);

      if (!customer) {
        throw new Error('Customer not found');
      }

      await markWebhookProcessed(webhookLogId, customer.metadata?.userId);

      // Validate website metadata
      const websiteFromMetadata = customer?.metadata?.website || session?.metadata?.website;
      if (websiteFromMetadata !== stripeConfig.website) {
        throw new Error('Website metadata not found or mismatched');
      }

      // Check if user already has a lifetime subscription
      const existingLifetimeSubscription = await Subscriber.findOne({
        user: customer.metadata.userId,
        plan: 'lifetime',
        subscriptionStatus: { $in: ['active', 'trialing'] },
      });

      if (existingLifetimeSubscription) {
        console.log('[Webhook] User already has lifetime subscription, skipping creation');
        await createSubscriptionHistory(customer.metadata.userId, 'lifetime_created', {
          plan: 'lifetime',
          stripeCustomerId: customer.id,
          stripeSubscriptionId: session.id,
          metadata: { note: 'lifetime checkout but lifetime exists already' },
        });
        return { message: 'Lifetime subscription already exists' };
      }

      // Create lifetime subscription data
      const lifetimeSubscriptionData = {
        user: customer.metadata.userId,
        plan: 'lifetime',
        stripeCustomerId: customer.id,
        stripeSubscriptionId: session.id,
        paymentMethod: session.payment_intent ? [session.payment_intent] : [],
        priceId: stripeConfig.lifetimePrice,
        priceAmount: session.amount_total ? session.amount_total / 100 : null, // ✅ added
        priceCurrency: session.currency || null, // ✅ added
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date('2099-12-31'),
        billingAddress: session.customer_details
          ? new Map(Object.entries(session.customer_details))
          : new Map(),
        isTrial: false,
        trialStartDate: null,
        trialEndDate: null,
      };

      // Update existing subscription or create new one
      let subscriptionDoc = await Subscriber.findOne({ stripeCustomerId: customer.id });
      if (subscriptionDoc) {
        await Subscriber.updateOne({ _id: subscriptionDoc._id }, lifetimeSubscriptionData);
        console.log('[Webhook] Updated existing subscription to lifetime');
      } else {
        subscriptionDoc = await Subscriber.create(lifetimeSubscriptionData);
        console.log('[Webhook] Created lifetime subscription in MongoDB');
      }

      await updateUserSubscription(customer.metadata.userId, subscriptionDoc._id, true);

      await createSubscriptionHistory(customer.metadata.userId, 'lifetime_created', {
        plan: 'lifetime',
        stripeCustomerId: customer.id,
        stripeSubscriptionId: session.id,
        priceAmount: lifetimeSubscriptionData.priceAmount, // ✅
        priceCurrency: lifetimeSubscriptionData.priceCurrency, // ✅
        metadata: { sessionId: session.id },
      });

      return { message: 'Lifetime subscription created successfully' };
    } catch (error) {
      console.error('[Webhook] Error processing lifetime subscription checkout:', error);
      throw error;
    }
  }

  // Handle regular subscription checkouts
  if (session.mode === 'subscription') {
    console.log('[Webhook] Processing regular subscription checkout');

    // If Stripe already attached a subscription id on the session, hydrate immediately
    if (session.subscription) {
      try {
        const liveSubscription = await stripe.subscriptions.retrieve(session.subscription);
        console.log('[Webhook] Retrieved live subscription from Stripe', {
          id: liveSubscription?.id,
          status: liveSubscription?.status,
          customer: liveSubscription?.customer,
        });
        const fauxEvent = {
          type: 'customer.subscription.created',
          data: { object: liveSubscription },
        };
        console.log('[Webhook] Hydrating from checkout -> subscription.created', {
          subscriptionId: liveSubscription?.id,
          status: liveSubscription?.status,
        });
        const result = await handleSubscriptionEvent(fauxEvent, webhookLogId);
        console.log('[Webhook] Hydration handler result', result);
        return result;
      } catch (e) {
        console.error('[Webhook] Failed to hydrate subscription from checkout:', e);
      }
    }

    // Create history entry for checkout completion
    const maybeUserId = session.metadata?.userId || null;
    if (maybeUserId) {
      await createSubscriptionHistory(maybeUserId, 'checkout_completed', {
        plan: session.metadata?.plan || null,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription || null,
        metadata: { sessionId: session.id },
      });
    }

    await markWebhookProcessed(webhookLogId);
    return { message: 'Subscription checkout completed, waiting for subscription event' };
  }

  await markWebhookProcessed(webhookLogId);
  return { message: 'Checkout session completed' };
};
