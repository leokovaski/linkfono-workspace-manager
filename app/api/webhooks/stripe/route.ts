import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWebhookSignature } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature);

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const supabase = await createClient();

  const subscriptionEndsAt = (subscription as any).current_period_end
    ? new Date((subscription as any).current_period_end * 1000)
    : null;

  // Determine status based on subscription status
  let status: 'trial' | 'active' | 'inactive' | 'payment_pending' | 'cancelled' | 'suspended';

  switch (subscription.status) {
    case 'active':
      status = 'active';
      break;
    case 'trialing':
      status = 'trial';
      break;
    case 'past_due':
      status = 'payment_pending';
      break;
    case 'canceled':
    case 'unpaid':
      status = 'cancelled';
      break;
    case 'incomplete':
    case 'incomplete_expired':
      status = 'payment_pending';
      break;
    default:
      status = 'inactive';
  }

  // Update workspace
  const { error } = await (supabase as any)
    .from('workspaces')
    .update({
      status,
      stripe_subscription_id: subscription.id,
      subscription_ends_at: subscriptionEndsAt?.toISOString() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating workspace subscription:', error);
    throw error;
  }

  console.log(`Subscription ${subscription.id} updated to status: ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = await createClient();

  // Update workspace status to cancelled
  const { error } = await (supabase as any)
    .from('workspaces')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error cancelling workspace subscription:', error);
    throw error;
  }

  console.log(`Subscription ${subscription.id} deleted`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const supabase = await createClient();

  if (!(invoice as any).subscription) {
    return;
  }

  // Update workspace to active status on successful payment
  const { error } = await (supabase as any)
    .from('workspaces')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', (invoice as any).subscription as string);

  if (error) {
    console.error('Error updating workspace after payment success:', error);
    throw error;
  }

  console.log(`Payment succeeded for subscription ${(invoice as any).subscription}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = await createClient();

  if (!(invoice as any).subscription) {
    return;
  }

  // Update workspace to payment_pending status on failed payment
  const { error } = await (supabase as any)
    .from('workspaces')
    .update({
      status: 'payment_pending',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', (invoice as any).subscription as string);

  if (error) {
    console.error('Error updating workspace after payment failure:', error);
    throw error;
  }

  console.log(`Payment failed for subscription ${(invoice as any).subscription}`);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = await createClient();

  if (!session.subscription) {
    return;
  }

  // Update workspace with payment information after checkout
  const { error } = await (supabase as any)
    .from('workspaces')
    .update({
      stripe_subscription_id: session.subscription as string,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', session.customer as string);

  if (error) {
    console.error('Error updating workspace after checkout:', error);
    throw error;
  }

  console.log(`Checkout completed for session ${session.id}`);
}
