# Subscription API Routes

This directory contains all the subscription-related API routes for the Next.js application, integrated with Stripe and MongoDB.

## API Endpoints

### 1. Create Checkout Session
**POST** `/api/subscription/create-session`

Creates a Stripe checkout session for subscription plans.

**Request Body:**
```json
{
  "plan": "monthly" | "yearly" | "lifetime"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_...",
  "redirect_url": "https://billing.stripe.com/..." // if user has active subscription
}
```

### 2. Stripe Webhook
**POST** `/api/subscription/webhook`

Handles Stripe webhook events for subscription lifecycle management.

**Headers Required:**
- `stripe-signature`: Stripe webhook signature

### 3. Cancel Subscription
**POST** `/api/subscription/cancel`

Cancels a subscription (immediately or at period end).

**Request Body:**
```json
{
  "subscriptionId": "sub_...",
  "cancelAtPeriodEnd": true // optional, defaults to true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancellation scheduled...",
  "subscriptionStatus": "scheduled_for_cancellation",
  "subscription": { ... }
}
```

### 4. Get Current Subscription
**GET** `/api/subscription/current`

Gets the current user's subscription.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": "...",
    "plan": "monthly",
    "subscriptionStatus": "active",
    "subscriptionStartDate": "2024-01-01T00:00:00.000Z",
    "subscriptionEndDate": "2024-02-01T00:00:00.000Z",
    ...
  }
}
```

### 5. Get All Subscribers (Admin)
**GET** `/api/subscription/all`

Gets all subscribers (admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user": { ... },
      "plan": "monthly",
      "subscriptionStatus": "active",
      ...
    }
  ]
}
```

### 6. Get Subscription History
**GET** `/api/subscription/history/[userId]`

Gets subscription history for a specific user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "action": "created",
      "plan": "monthly",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "metadata": { ... }
    }
  ]
}
```

### 7. Get All Webhooks (Admin)
**GET** `/api/subscription/webhooks`

Gets all webhook logs (admin only).

### 8. Get Webhooks by User
**GET** `/api/subscription/webhooks/[userId]`

Gets webhook logs for a specific user.

## Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Subscription URLs
SUBSCRIPTION_SUCCESS_URL=https://yourdomain.com/success
SUBSCRIPTION_CANCEL_URL=https://yourdomain.com/cancel
SUBSCRIPTION_RETURN_URL=https://yourdomain.com/billing

# Trial Period
SUBSCRIPTION_TRIAL_PERIOD_DAYS=7
```

## Stripe Price IDs

Update the price IDs in `src/configs/stripe.js`:

```javascript
export const stripeConfig = {
  monthlyPrice: 'price_1RtRrdIvRUTQBOxaElD7rMOr',
  yearlyPrice: 'price_1RtSKmIvRUTQBOxahzPBw0WH',
  lifetimePrice: 'price_1RuqUHIvRUTQBOxaNFpQ9cCh',
  // ...
};
```

## Frontend Integration

### Creating a Checkout Session

```javascript
const createCheckoutSession = async (plan) => {
  try {
    const response = await fetch('/api/subscription/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    });

    const data = await response.json();
    
    if (data.success) {
      if (data.redirect_url) {
        // User has active subscription, redirect to billing portal
        window.location.href = data.redirect_url;
      } else {
        // Redirect to Stripe checkout
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
  }
};
```

### Getting Current Subscription

```javascript
const getCurrentSubscription = async () => {
  try {
    const response = await fetch('/api/subscription/current');
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
  } catch (error) {
    console.error('Error getting subscription:', error);
  }
};
```

### Canceling Subscription

```javascript
const cancelSubscription = async (subscriptionId, cancelAtPeriodEnd = true) => {
  try {
    const response = await fetch('/api/subscription/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        subscriptionId, 
        cancelAtPeriodEnd 
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error canceling subscription:', error);
  }
};
```

## Deployment

### Local Development

1. Install Stripe CLI:
   ```bash
   npm install -g stripe-cli
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to local development:
   ```bash
   stripe listen --forward-to localhost:3000/api/subscription/webhook
   ```

4. Copy the webhook signing secret and add it to your `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Production Deployment (Vercel)

1. Set environment variables in Vercel dashboard:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUBSCRIPTION_SUCCESS_URL`
   - `SUBSCRIPTION_CANCEL_URL`
   - `SUBSCRIPTION_RETURN_URL`
   - `SUBSCRIPTION_TRIAL_PERIOD_DAYS`

2. Configure webhook endpoint in Stripe dashboard:
   - URL: `https://yourdomain.com/api/subscription/webhook`
   - Events to send:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `customer.subscription.paused`
     - `customer.subscription.resumed`
     - `customer.subscription.trial_will_end`
     - `invoice.payment_succeeded`
     - `checkout.session.completed`

3. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

### Custom Server Deployment

1. Set environment variables on your server
2. Configure webhook endpoint in Stripe dashboard
3. Ensure your server can handle the webhook traffic
4. Consider implementing webhook retry logic for high-volume scenarios

## Security Best Practices

1. **Webhook Signature Verification**: All webhooks are verified using Stripe's signature verification
2. **Authentication**: All endpoints require user authentication
3. **Authorization**: Admin endpoints check for admin role
4. **Input Validation**: All inputs are validated before processing
5. **Error Handling**: Comprehensive error handling with proper HTTP status codes
6. **Logging**: Detailed logging for debugging and monitoring

## Monitoring and Debugging

1. **Webhook Logs**: All webhook events are logged to the database
2. **Subscription History**: All subscription actions are tracked
3. **Error Logging**: Comprehensive error logging throughout the system
4. **Stripe Dashboard**: Monitor events and payments in Stripe dashboard

## Testing

1. Use Stripe test mode for development
2. Test webhook events using Stripe CLI
3. Verify subscription lifecycle events
4. Test error scenarios and edge cases
5. Validate authentication and authorization

## Support

For issues or questions:
1. Check the logs in your application
2. Review webhook logs in the database
3. Check Stripe dashboard for payment/subscription status
4. Verify environment variables are set correctly
