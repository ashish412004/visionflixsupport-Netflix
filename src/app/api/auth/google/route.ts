import { NextRequest, NextResponse } from 'next/server';
import { getGoogleOAuthUrl } from '@/lib/gmail/service';

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;
    const redirectUri = `${origin}/api/auth/google/callback`;

    const authUrl = getGoogleOAuthUrl(redirectUri);
    return NextResponse.redirect(authUrl);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Google OAuth failed to initialize';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
