import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({
        isConnected: false,
        isConfiguredInEnv: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ isConnected: false });
    }

    const { data, error } = await supabase
      .from('gmail_integrations')
      .select('email_address, is_connected, last_synced_at, scope')
      .eq('user_id', user.id)
      .eq('is_connected', true)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({
        isConnected: false,
        isConfiguredInEnv: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      });
    }

    return NextResponse.json({
      isConnected: true,
      emailAddress: data.email_address,
      lastSyncedAt: data.last_synced_at,
      scope: data.scope,
      isConfiguredInEnv: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error checking status';
    return NextResponse.json({ isConnected: false, error: msg });
  }
}
