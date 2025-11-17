import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createStripeCustomer, createSubscription } from '@/lib/stripe';
import { getStripePriceId, getPlanConfig } from '@/lib/constants/plans';
import type { CreateWorkspaceData, ApiResponse, WorkspaceWithSettings } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');

    if (!userId || !userEmail) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as CreateWorkspaceData;
    const { plan_type, settings, ...workspaceData } = body;

    // Validate plan
    const planConfig = getPlanConfig(plan_type);
    if (!planConfig) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user already used trial
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('trial_used, full_name, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const canUseTrial = !(profile as any).trial_used;
    const trialDays = canUseTrial ? 7 : 0;

    // Create Stripe customer
    const customer = await createStripeCustomer({
      email: profile.email,
      name: profile.full_name || workspaceData.name,
      metadata: {
        userId,
        workspaceName: workspaceData.name,
      },
    });

    // Create Stripe subscription
    const subscription = await createSubscription({
      customerId: customer.id,
      priceId: getStripePriceId(plan_type),
      trialPeriodDays: trialDays,
      metadata: {
        userId,
        workspaceName: workspaceData.name,
        planType: plan_type,
      },
    });

    // Calculate trial_ends_at and subscription_ends_at
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
    const subscriptionEndsAt = (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000)
      : null;

    // Create workspace in database
    const { data: workspace, error: workspaceError } = await (supabase as any)
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
        status: canUseTrial ? 'trial' : 'payment_pending',
        plan_type,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        trial_ends_at: trialEndsAt.toISOString(),
        subscription_ends_at: subscriptionEndsAt?.toISOString(),
        max_patients: planConfig.maxPatients,
        max_members: planConfig.maxMembers,
      })
      .select()
      .single();

    if (workspaceError || !workspace) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to create workspace' },
        { status: 500 }
      );
    }

    // Create workspace settings
    const { data: workspaceSettings, error: settingsError } = await (supabase as any)
      .from('workspace_settings')
      .insert({
        workspace_id: workspace.id,
        appointment_duration: settings.appointment_duration || 50,
        reminder_hours_before: settings.reminder_hours_before || 24,
        allow_online_booking: false,
      })
      .select()
      .single();

    if (settingsError || !workspaceSettings) {
      // Rollback workspace creation
      await (supabase as any).from('workspaces').delete().eq('id', workspace.id);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to create workspace settings' },
        { status: 500 }
      );
    }

    // Create workspace member (owner)
    const { data: member, error: memberError} = await (supabase as any)
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: userId,
        role: 'owner',
        is_active: true,
      })
      .select()
      .single();

    if (memberError || !member) {
      // Rollback workspace and settings creation
      await (supabase as any).from('workspace_settings').delete().eq('workspace_id', workspace.id);
      await (supabase as any).from('workspaces').delete().eq('id', workspace.id);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to create workspace member' },
        { status: 500 }
      );
    }

    // Update user's trial_used if they just used it
    if (canUseTrial) {
      await (supabase as any)
        .from('profiles')
        .update({ trial_used: true })
        .eq('id', userId);
    }

    const response: WorkspaceWithSettings = {
      workspace,
      settings: workspaceSettings,
      member,
    };

    return NextResponse.json<ApiResponse<WorkspaceWithSettings>>(
      { success: true, data: response },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get all workspaces where user is a member
    const { data: members, error: membersError } = await (supabase as any)
      .from('workspace_members')
      .select(`
        *,
        workspaces (
          *,
          workspace_settings (*)
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (membersError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to fetch workspaces' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: members },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
