import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession, getOrCreateCustomer } from '@/lib/stripe';
import { getStripePriceId } from '@/lib/constants/plans';
import type { PlanType } from '@/types';

type ProfileData = {
  email: string;
  full_name: string;
  stripe_customer_id: string | null;
};

export async function POST(request: NextRequest) {
  try {
    // Get userId from cookie (set by middleware)
    const userId = request.cookies.get('auth-user-id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Parse request body
    const body = await request.json();
    const { workspaceData, planType, trialAvailable } = body;

    if (!workspaceData || !planType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name, stripe_customer_id')
      .eq('id', userId)
      .single() as { data: ProfileData | null; error: any };

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Create or get Stripe customer
    const customer = await getOrCreateCustomer({
      customerId: profile.stripe_customer_id,
      email: profile.email,
      name: profile.full_name,
      metadata: {
        userId,
      },
    });

    // If customer was newly created, save the stripe_customer_id to profile
    if (!profile.stripe_customer_id) {
      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update profile with stripe_customer_id:', updateError);
        // Don't fail the request, just log the error
      }
    }

    // Get Stripe price ID
    const stripePriceId = getStripePriceId(planType);

    if (!stripePriceId) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Determine trial period
    const trialPeriodDays = trialAvailable ? 7 : 0;

    // Create metadata to pass workspace data through checkout
    const metadata = {
      userId,
      planType: planType as PlanType,
      workspaceData: JSON.stringify(workspaceData),
      isFirstWorkspace: trialAvailable.toString(),
    };

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: customer.id,
      priceId: stripePriceId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/new/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/new`,
      trialPeriodDays,
      metadata,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
