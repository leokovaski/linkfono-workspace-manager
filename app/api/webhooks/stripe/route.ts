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

  if (!session.subscription || !session.metadata) {
    console.error('Missing subscription or metadata in checkout session');
    return;
  }

  try {
    const { userId, planType, workspaceData: workspaceDataStr, isFirstWorkspace } = session.metadata;

    if (!userId || !planType || !workspaceDataStr) {
      console.error('Missing required metadata fields');
      return;
    }

    const workspaceData = JSON.parse(workspaceDataStr);

    // Get plan configuration
    const { getPlanConfig } = await import('@/lib/constants/plans');
    const planConfig = getPlanConfig(planType);

    if (!planConfig) {
      console.error('Invalid plan type:', planType);
      return;
    }

    // Calculate trial end date (7 days from now if trial available)
    const trialEndsAt = isFirstWorkspace === 'true'
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : new Date();

    // 1. Create workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: workspaceData.name,
        cpf_cnpj: workspaceData.cpf_cnpj,
        address: workspaceData.address,
        number: workspaceData.number,
        complement: workspaceData.complement,
        neighborhood: workspaceData.neighborhood,
        city: workspaceData.city,
        state: workspaceData.state,
        zip_code: workspaceData.zip_code,
        status: isFirstWorkspace === 'true' ? 'trial' : 'active',
        plan_type: planType,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        trial_ends_at: trialEndsAt.toISOString(),
        max_patients: planConfig.maxPatients,
        max_members: planConfig.maxMembers,
      })
      .select()
      .single();

    if (workspaceError) {
      console.error('Error creating workspace:', workspaceError);
      throw workspaceError;
    }

    // 2. Create workspace settings
    const { error: settingsError } = await supabase
      .from('workspace_settings')
      .insert({
        workspace_id: workspace.id,
        appointment_duration: workspaceData.settings.appointment_duration,
        reminder_hours_before: workspaceData.settings.reminder_hours_before,
      });

    if (settingsError) {
      console.error('Error creating workspace settings:', settingsError);
      throw settingsError;
    }

    // 3. Create workspace member (owner)
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: userId,
        role: 'owner',
        is_active: true,
      });

    if (memberError) {
      console.error('Error creating workspace member:', memberError);
      throw memberError;
    }

    // 4. If this is the first workspace, mark trial as used
    if (isFirstWorkspace === 'true') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ trial_used: true })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating profile trial_used:', profileError);
        // Don't throw here, workspace was already created successfully
      }
    }

    console.log(`Workspace created successfully for session ${session.id}`);
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error);
    throw error;
  }
}
