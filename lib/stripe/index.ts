import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

// Helper function to create a customer
export async function createStripeCustomer(params: {
  email: string;
  name: string;
  metadata?: Record<string, string>;
}) {
  return await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata,
  });
}

// Helper function to create a subscription
export async function createSubscription(params: {
  customerId: string;
  priceId: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}) {
  return await stripe.subscriptions.create({
    customer: params.customerId,
    items: [{ price: params.priceId }],
    trial_period_days: params.trialPeriodDays,
    metadata: params.metadata,
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
}

// Helper function to update a subscription
export async function updateSubscription(
  subscriptionId: string,
  params: {
    priceId?: string;
    metadata?: Record<string, string>;
  }
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await stripe.subscriptions.update(subscriptionId, {
    items: params.priceId ? [
      {
        id: subscription.items.data[0].id,
        price: params.priceId,
      },
    ] : undefined,
    metadata: params.metadata,
    proration_behavior: 'create_prorations',
  });
}

// Helper function to cancel a subscription
export async function cancelSubscription(
  subscriptionId: string,
  atPeriodEnd: boolean = true
) {
  if (atPeriodEnd) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    return await stripe.subscriptions.cancel(subscriptionId);
  }
}

// Helper function to retrieve a subscription
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method'],
  });
}

// Helper function to create a payment intent
export async function createPaymentIntent(params: {
  amount: number;
  currency: string;
  customerId: string;
  metadata?: Record<string, string>;
}) {
  return await stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency,
    customer: params.customerId,
    metadata: params.metadata,
    automatic_payment_methods: { enabled: true },
  });
}

// Helper function to create a setup intent for saving payment method
export async function createSetupIntent(customerId: string) {
  return await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
  });
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// Helper function to create a checkout session
export async function createCheckoutSession(params: {
  customerId?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  const { customerId, priceId, successUrl, cancelUrl, trialPeriodDays, metadata } = params;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  };

  if (customerId) {
    sessionParams.customer = customerId;
  }

  if (trialPeriodDays && trialPeriodDays > 0) {
    sessionParams.subscription_data = {
      trial_period_days: trialPeriodDays,
      metadata,
    };
  } else if (metadata) {
    sessionParams.subscription_data = {
      metadata,
    };
  }

  return await stripe.checkout.sessions.create(sessionParams);
}

// Helper function to get or create a customer (avoids duplicates)
export async function getOrCreateCustomer(params: {
  customerId?: string | null;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  // If customerId exists, try to retrieve the customer
  if (params.customerId) {
    try {
      const customer = await stripe.customers.retrieve(params.customerId);

      // Check if customer was deleted
      if (customer.deleted) {
        console.log(`Customer ${params.customerId} was deleted, creating new one`);
      } else {
        return customer as Stripe.Customer;
      }
    } catch (error) {
      console.error(`Failed to retrieve customer ${params.customerId}:`, error);
      // If customer doesn't exist, create a new one
    }
  }

  // Create new customer
  return await createStripeCustomer({
    email: params.email,
    name: params.name || '',
    metadata: params.metadata,
  });
}
