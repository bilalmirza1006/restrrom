import { stripe, stripeConfig } from '@/configs/stripe';

/**
 * Find or create a Stripe customer
 * @param {Object} user - User object from database
 * @param {string} plan - Subscription plan
 * @returns {Object} Stripe customer object
 */
export const findOrCreateCustomer = async (user, plan) => {
    try {
        // Search for existing customer by email and metadata
        const customerList = await stripe.customers.list({
            email: user.email,
            limit: 10,
        });

        // Find customer with matching metadata
        const existingCustomer = customerList.data.find(
            (cust) =>
                cust.metadata?.userId === String(user._id) &&
                cust.metadata?.website === stripeConfig.website
        );

        if (existingCustomer) {
            console.log('[Stripe] Found existing customer:', existingCustomer.id);
            return existingCustomer;
        }

        // Create new customer
        const newCustomer = await stripe.customers.create({
            name: user.fullName,
            email: user.email,
            phone: user.phoneNumber,
            metadata: {
                userId: String(user._id),
                plan,
                website: stripeConfig.website,
            },
        });

        console.log('[Stripe] Created new customer:', newCustomer.id);
        return newCustomer;
    } catch (error) {
        console.error('[Stripe] Error in findOrCreateCustomer:', error);
        throw error;
    }
};

/**
 * Check if customer has active or trialing subscription
 * @param {string} customerId - Stripe customer ID
 * @returns {Object|null} Active subscription or null
 */
export const getActiveSubscription = async (customerId) => {
    try {
        // Check for trialing subscriptions first
        let subscription = await stripe.subscriptions.list({
            customer: customerId,
            status: 'trialing',
            limit: 1,
        });

        if (subscription?.data?.length > 0) {
            return subscription.data[0];
        }

        // Check for active subscriptions
        subscription = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            limit: 1,
        });

        return subscription?.data?.length > 0 ? subscription.data[0] : null;
    } catch (error) {
        console.error('[Stripe] Error checking active subscription:', error);
        throw error;
    }
};

/**
 * Create billing portal session for existing customer
 * @param {string} customerId - Stripe customer ID
 * @returns {Object} Billing portal session
 */
export const createBillingPortalSession = async (customerId) => {
    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: stripeConfig.returnUrl,
        });

        return session;
    } catch (error) {
        console.error('[Stripe] Error creating billing portal session:', error);
        throw error;
    }
};
