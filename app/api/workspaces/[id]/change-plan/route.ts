import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateSubscription } from '@/lib/stripe';
import { getStripePriceId, getPlanConfig } from '@/lib/constants/plans';
import type { ApiResponse, PlanType } from '@/types';

interface ChangePlanRequest {
  new_plan_type: PlanType;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Verify user is owner of this workspace
    const { data: member } = await (supabase as any)
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', id)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (!member || (member as any).role !== 'owner') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Only workspace owner can change plan' },
        { status: 403 }
      );
    }

    // Get current workspace
    const { data: workspace, error: workspaceError } = await (supabase as any)
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single();

    if (workspaceError || !workspace) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Workspace not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as ChangePlanRequest;
    const { new_plan_type } = body;

    // Validate new plan
    const newPlanConfig = getPlanConfig(new_plan_type);
    if (!newPlanConfig) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Check if trying to change to the same plan
    if (workspace.plan_type === new_plan_type) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Workspace is already on this plan' },
        { status: 400 }
      );
    }

    // Update Stripe subscription if exists
    if (workspace.stripe_subscription_id) {
      try {
        await updateSubscription(workspace.stripe_subscription_id, {
          priceId: getStripePriceId(new_plan_type),
          metadata: {
            planType: new_plan_type,
          },
        });
      } catch (stripeError) {
        console.error('Error updating Stripe subscription:', stripeError);
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Failed to update subscription in Stripe' },
          { status: 500 }
        );
      }
    }

    // Update workspace in database
    const { data: updatedWorkspace, error: updateError } = await (supabase as any)
      .from('workspaces')
      .update({
        plan_type: new_plan_type,
        max_patients: newPlanConfig.maxPatients,
        max_members: newPlanConfig.maxMembers,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedWorkspace) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to update workspace plan' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          workspace: updatedWorkspace,
          message: 'Plan updated successfully',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error changing workspace plan:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
