import { connectDb } from '@/configs/connectDb';
import { stripe, stripeConfig } from '@/configs/stripe';
import {
  logWebhookEvent,
  handleSubscriptionEvent,
  handleInvoiceEvent,
  handleCheckoutEvent,
} from '@/lib/stripe/webhookService';
import { asyncHandler } from '@/utils/asyncHandler';
import { customError } from '@/utils/customError';
import { NextResponse } from 'next/server';

// Ensure Node.js runtime (required for Stripe's signature verification)
export const runtime = 'nodejs';
// Always treat this route as dynamic (no caching)
export const dynamic = 'force-dynamic';
export const config = {
  api: {
    bodyParser: false,
  },
};
// Healthcheck GET to confirm routing/ngrok reachability (no Stripe verification)
export async function GET() {
  console.log('[Stripe Webhook][GET] >>> HIT (healthcheck)', new Date().toISOString());
  return NextResponse.json({ ok: true, message: 'Webhook GET reachable' });
}

export const POST = asyncHandler(async (req) => {
  await connectDb();

  console.log('[Stripe Webhook] >>> HIT', new Date().toISOString());

  const headersObject = Object.fromEntries(req.headers.entries());
  const signature = req.headers.get('stripe-signature');
  const secret = stripeConfig.webhookSecret;

  if (!secret) {
    console.error('[Stripe Webhook] No STRIPE_WEBHOOK_SECRET configured');
    throw new customError(500, 'Webhook secret not configured');
  }

  if (!signature) {
    console.error('[Stripe Webhook] No signature found');
    throw new customError(400, 'Signature not found');
  }

  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
    console.log('[Stripe Webhook] Event constructed successfully', {
      type: event.type,
      id: event.id,
      apiVersion: event.api_version,
    });
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const webhookLogId = await logWebhookEvent(event, headersObject);

  try {
    let result;
    if (event.type.startsWith('customer.subscription.')) {
      result = await handleSubscriptionEvent(event, webhookLogId);
    } else if (event.type === 'invoice.payment_succeeded') {
      result = await handleInvoiceEvent(event, webhookLogId);
    } else if (event.type === 'checkout.session.completed') {
      result = await handleCheckoutEvent(event, webhookLogId);
    } else {
      console.log('[Stripe Webhook] Unhandled event type:', event.type);
      result = { message: 'Event received but not processed' };
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing event:', error);
    throw new customError(500, `Error processing webhook: ${error.message}`);
  }
});
//sdsd
