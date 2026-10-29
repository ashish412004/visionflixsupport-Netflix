import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchNetflixNotifications, refreshGoogleAccessToken } from '@/lib/gmail/service';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ messages: [], error: 'Supabase client unavailable' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ messages: [], error: 'User must be authenticated' }, { status: 401 });
    }

    const { data: integration, error } = await supabase
      .from('gmail_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_connected', true)
      .maybeSingle();

    if (error || !integration) {
      return NextResponse.json({
        messages: [],
        isConnected: false,
        message: 'No connected Gmail account. Please connect your Gmail inbox.',
      });
    }

    let accessToken = integration.encrypted_access_token;
    const expiry = integration.token_expiry ? new Date(integration.token_expiry).getTime() : 0;

    // Refresh token if expired or about to expire in 60 seconds
    if (expiry && Date.now() > expiry - 60000 && integration.encrypted_refresh_token) {
      try {
        const refreshed = await refreshGoogleAccessToken(integration.encrypted_refresh_token);
        accessToken = refreshed.accessToken;
        const newExpiry = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString();

        await supabase
          .from('gmail_integrations')
          .update({
            encrypted_access_token: refreshed.accessToken,
            token_expiry: newExpiry,
            updated_at: new Date().toISOString(),
          })
          .eq('id', integration.id);
      } catch (refreshErr) {
        console.error('Failed refreshing token:', refreshErr);
      }
    }

    const notifications = await fetchNetflixNotifications(accessToken, 15);

    // Update last_synced_at timestamp
    await supabase
      .from('gmail_integrations')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', integration.id);

    return NextResponse.json({
      isConnected: true,
      emailAddress: integration.email_address,
      messages: notifications,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch messages';
    return NextResponse.json({ messages: [], error: msg }, { status: 500 });
  }
}
