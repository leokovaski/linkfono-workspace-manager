import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, WorkspaceSettingsUpdate } from '@/types';

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
        { success: false, error: 'Only workspace owner can edit settings' },
        { status: 403 }
      );
    }

    const body = await request.json() as WorkspaceSettingsUpdate;

    // Only allow editing specific fields
    const allowedFields: WorkspaceSettingsUpdate = {};
    if (body.appointment_duration !== undefined) {
      allowedFields.appointment_duration = body.appointment_duration;
    }
    if (body.reminder_hours_before !== undefined) {
      allowedFields.reminder_hours_before = body.reminder_hours_before;
    }

    // Update workspace settings
    const { data: settings, error: settingsError } = await (supabase as any)
      .from('workspace_settings')
      .update({
        ...allowedFields,
        updated_at: new Date().toISOString(),
      })
      .eq('workspace_id', id)
      .select()
      .single();

    if (settingsError || !settings) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to update workspace settings' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: settings },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating workspace settings:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
