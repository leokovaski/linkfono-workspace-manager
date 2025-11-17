import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, WorkspaceUpdate } from '@/types';

export async function GET(
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

    // Verify user has access to this workspace
    const { data: member } = await (supabase as any)
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', id)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (!member) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Workspace not found or access denied' },
        { status: 404 }
      );
    }

    // Get workspace with settings
    const { data: workspace, error: workspaceError } = await (supabase as any)
      .from('workspaces')
      .select(`
        *,
        workspace_settings (*)
      `)
      .eq('id', id)
      .single();

    if (workspaceError || !workspace) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Workspace not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: { workspace, member } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
        { success: false, error: 'Only workspace owner can edit workspace' },
        { status: 403 }
      );
    }

    const body = await request.json() as WorkspaceUpdate;

    // Update workspace
    const { data: workspace, error: workspaceError } = await (supabase as any)
      .from('workspaces')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (workspaceError || !workspace) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to update workspace' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: workspace },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
        { success: false, error: 'Only workspace owner can delete workspace' },
        { status: 403 }
      );
    }

    // Soft delete: update status to 'cancelled'
    const { data: workspace, error: workspaceError } = await (supabase as any)
      .from('workspaces')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (workspaceError || !workspace) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to delete workspace' },
        { status: 500 }
      );
    }

    // Cancel Stripe subscription if exists
    if (workspace.stripe_subscription_id) {
      try {
        const { cancelSubscription } = await import('@/lib/stripe');
        await cancelSubscription(workspace.stripe_subscription_id, false);
      } catch (stripeError) {
        console.error('Error cancelling Stripe subscription:', stripeError);
        // Continue with deletion even if Stripe cancellation fails
      }
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: workspace },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
