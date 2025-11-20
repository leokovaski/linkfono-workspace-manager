import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export function verifyWebhookSignature(body: string, signature: string): Stripe.Event {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET');
  }

  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
}

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

export async function createCustomer(params: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata,
  });
}

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
  return await createCustomer({
    email: params.email,
    name: params.name,
    metadata: params.metadata,
  });
}
