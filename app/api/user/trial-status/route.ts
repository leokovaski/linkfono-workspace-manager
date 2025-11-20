import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Check trial_used from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('trial_used')
      .eq('id', userId)
      .single() as { data: { trial_used: boolean } | null; error: any };

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      trialUsed: profile?.trial_used || false,
    });
  } catch (error) {
    console.error('Error checking trial status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
