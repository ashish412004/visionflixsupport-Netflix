import { NextRequest, NextResponse } from 'next/server';
import { getGoogleOAuthUrl } from '@/lib/gmail/service';

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
  try {
    const redirectUri = getRedirectUri(req);
    const authUrl = getGoogleOAuthUrl(redirectUri);
    return NextResponse.redirect(authUrl);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Google OAuth failed to initialize';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
