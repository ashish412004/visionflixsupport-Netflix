import { NextRequest, NextResponse } from 'next/server';
import { exchangeGoogleAuthCode, getGoogleUserEmail } from '@/lib/gmail/service';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function getRedirectUri(req: NextRequest): string {
  const reqOrigin = req.nextUrl.origin;
  if (reqOrigin && reqOrigin.includes('localhost')) {
    return `${reqOrigin.replace(/\/$/, '')}/api/auth/google/callback`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/api/auth/google/callback`;
  }
  return `${reqOrigin.replace(/\/$/, '')}/api/auth/google/callback`;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const origin = req.nextUrl.origin.includes('localhost')
    ? req.nextUrl.origin
    : (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || req.nextUrl.origin);
  const redirectUri = getRedirectUri(req);

  if (error || !code) {
    return NextResponse.redirect(`${origin}/admin/accounts?error=${encodeURIComponent(error || 'Authorization cancelled')}`);
  }

  try {
    const tokens = await exchangeGoogleAuthCode(code, redirectUri);
    const userEmail = await getGoogleUserEmail(tokens.accessToken);

    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Calculate expiry timestamp
        const expiryDate = new Date(Date.now() + tokens.expiresIn * 1000).toISOString();

        await supabase.from('gmail_integrations').upsert(
          {
            user_id: user.id,
            email_address: userEmail,
            encrypted_access_token: tokens.accessToken,
            encrypted_refresh_token: tokens.refreshToken || null,
            token_expiry: expiryDate,
            scope: tokens.scope,
            is_connected: true,
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,email_address' }
        );
      }
    }

    return NextResponse.redirect(`${origin}/admin/accounts?gmail=connected&email=${encodeURIComponent(userEmail)}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to complete Google OAuth';
    return NextResponse.redirect(`${origin}/admin/accounts?error=${encodeURIComponent(msg)}`);
  }
}
