import Stripe from 'stripe';
import { env } from './env.js';

/**
 * Stripe helpers. Fully implemented, but every entry point guards on
 * STRIPE_SECRET_KEY so the app builds and runs before keys are supplied —
 * calling any of these without the key throws a clear, actionable error.
 * (This is the "stubbed until keys arrive" state from the build plan.)
 */
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error(
      '[shared-backend] STRIPE_SECRET_KEY is not set — Stripe is not configured yet.'
    );
  }
  if (!_stripe) _stripe = new Stripe(env.STRIPE_SECRET_KEY);
  return _stripe;
}

/** True once Stripe keys are present — use to gate buy buttons in the UI. */
export function isStripeConfigured(): boolean {
  return Boolean(env.STRIPE_SECRET_KEY);
}

export interface CheckoutParams {
  productName: string;
  amount: number; // cents
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  /** Carried through to the webhook so the order can be attributed. */
  metadata: { site_id: string; product_id: string };
  customerEmail?: string;
}

export async function createCheckoutSession(params: CheckoutParams) {
  const stripe = getStripe();
  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: params.currency ?? 'usd',
          product_data: { name: params.productName },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    customer_email: params.customerEmail,
  });
}

/** Verifies the Stripe-Signature header and returns the parsed event. */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error(
      '[shared-backend] STRIPE_WEBHOOK_SECRET is not set — cannot verify webhook.'
    );
  }
  return getStripe().webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );
}

/** Issues a full refund against the charge behind a completed checkout session. */
export async function refundBySession(stripeSessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
  if (!session.payment_intent) {
    throw new Error(`[shared-backend] No payment_intent on session ${stripeSessionId}`);
  }
  const paymentIntent =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent.id;
  return stripe.refunds.create({ payment_intent: paymentIntent });
}
