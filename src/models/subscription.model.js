import { Schema, model, models } from 'mongoose';

const subscriptionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
    plan: { type: String, enum: ['monthly', 'yearly', 'lifetime'], required: true },
    stripeCustomerId: { type: String, unique: true, required: true },
    stripeSubscriptionId: { type: String, required: true },
    paymentMethod: { type: [String] },
    priceId: { type: String, required: true },
    subscriptionStatus: { type: String, required: true },
    billingAddress: { type: Map, of: String, required: true },
    subscriptionStartDate: { type: Date, default: Date.now, required: true },
    subscriptionEndDate: { type: Date, required: true },
    trialStartDate: { type: Date },
    trialEndDate: { type: Date },
    isTrial: { type: Boolean, default: false },
    priceAmount: { type: Number, default: null }, // ✅ good
    priceCurrency: { type: String, default: null }, // ✅ good
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, stripeCustomerId: 1 });

const Subscriber = models.Subscriber || model('Subscriber', subscriptionSchema);

/**
 * SubscriptionHistory: every action (create, renew, cancel, expire, update, etc.)
 * recorded against the user for audit/history purposes.
 */
const subscriptionHistorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
    action: {
      type: String,
      enum: [
        'created',
        'renewed',
        'canceled',
        'scheduled_for_cancellation',
        'expired',
        'updated',
        'deleted',
        'paused',
        'resumed',
        'trial_started',
        'trial_ended',
        'lifetime_created',
        'checkout_completed',
      ],
      required: true,
    },
    plan: { type: String, enum: ['monthly', 'yearly', 'lifetime', null], default: null },
    priceAmount: { type: Number, default: null }, // ✅ new
    priceCurrency: { type: String, default: null }, // ✅ new
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    note: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

subscriptionHistorySchema.index({ user: 1, stripeSubscriptionId: 1, createdAt: -1 });

// const SubscriptionHistory = model('SubscriptionHistory', subscriptionHistorySchema);

const SubscriptionHistory =
  models.SubscriptionHistory || model('SubscriptionHistory', subscriptionHistorySchema);

/**
 * WebhookLog: store each incoming webhook payload (after signature verification).
 * Keep the raw payload (event) and some searchable fields like eventType, userId if available.
 */
const webhookLogSchema = new Schema(
  {
    eventId: { type: String, required: true, index: true },
    eventType: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed, required: true },
    headers: { type: Schema.Types.Mixed },
    stripeCustomerId: { type: String, index: true },
    stripeSubscriptionId: { type: String, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'Auth', index: true, default: null },
    processed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// const WebhookLog = model('WebhookLog', webhookLogSchema);
const WebhookLog = models.WebhookLog || model('WebhookLog', webhookLogSchema);

export default Subscriber;
export { SubscriptionHistory, WebhookLog };
