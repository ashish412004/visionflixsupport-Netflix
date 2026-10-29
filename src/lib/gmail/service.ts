import { GmailNotificationMessage, GmailIntegrationInfo } from '@/types';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';
const GMAIL_READONLY_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

/**
 * Generate Google OAuth 2.0 Authorization URL
 * Requests minimum necessary read-only permissions for Gmail.
 */
export function getGoogleOAuthUrl(redirectUri: string, state?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured in environment variables.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GMAIL_READONLY_SCOPE,
    access_type: 'offline', // to obtain a refresh token
    prompt: 'consent',
    include_granted_scopes: 'true',
  });

  if (state) {
    params.set('state', state);
  }

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange Authorization Code for Access & Refresh Tokens
 */
export async function exchangeGoogleAuthCode(code: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth Client ID or Client Secret is missing.');
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to exchange code for tokens: ${errorBody}`);
  }

  const tokenData = await res.json();
  return {
    accessToken: tokenData.access_token as string,
    refreshToken: tokenData.refresh_token as string | undefined,
    expiresIn: tokenData.expires_in as number,
    scope: tokenData.scope as string,
  };
}

/**
 * Get User Email Address from Google userinfo API
 */
export async function getGoogleUserEmail(accessToken: string): Promise<string> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Failed to retrieve user email from Google userinfo.');
  }

  const data = await res.json();
  return data.email;
}

/**
 * Refresh expired Google Access Token
 */
export async function refreshGoogleAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured.');
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to refresh Google access token.');
  }

  const tokenData = await res.json();
  return {
    accessToken: tokenData.access_token as string,
    expiresIn: tokenData.expires_in as number,
  };
}

/**
 * Strict Security Sanitizer
 * Redacts any potential OTPs, numeric security codes, or one-time verification links
 * so that sensitive authentication tokens are NEVER exposed or logged.
 */
function sanitizeSnippet(rawSnippet: string): string {
  if (!rawSnippet) return '';
  
  // Redact 4 to 8 digit standalone numbers (e.g. OTP codes)
  let clean = rawSnippet.replace(/\b\d{4,8}\b/g, '[SECURITY CODE REDACTED]');
  
  // Redact one-time URLs
  clean = clean.replace(/https?:\/\/[^\s]+/g, '[SECURE LINK IN GMAIL]');
  
  return clean;
}

/**
 * Fetch Netflix Sign-in & Household Notification Emails
 * Queries messages strictly matching Netflix notification senders.
 */
export async function fetchNetflixNotifications(
  accessToken: string,
  maxResults = 10
): Promise<GmailNotificationMessage[]> {
  // Query only relevant Netflix account & household security emails
  const query = encodeURIComponent('from:(netflix.com OR account.netflix.com)');
  const listUrl = `${GMAIL_API_BASE}/messages?q=${query}&maxResults=${maxResults}`;

  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!listRes.ok) {
    const errorText = await listRes.text();
    throw new Error(`Gmail API error: ${listRes.status} - ${errorText}`);
  }

  const listData = await listRes.json();
  const messages: Array<{ id: string; threadId: string }> = listData.messages || [];

  if (messages.length === 0) {
    return [];
  }

  // Fetch details for each message
  const details = await Promise.all(
    messages.slice(0, maxResults).map(async (item) => {
      try {
        const msgRes = await fetch(
          `${GMAIL_API_BASE}/messages/${item.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: 'no-store',
          }
        );

        if (!msgRes.ok) return null;
        const msgData = await msgRes.json();

        const headers: Array<{ name: string; value: string }> = msgData.payload?.headers || [];
        const sender = headers.find((h) => h.name.toLowerCase() === 'from')?.value || 'Netflix';
        const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || new Date().toISOString();

        const isHouseholdAlert = /household|hogar|foyer|device|travel/i.test(subject) ||
          /household|part of your netflix household/i.test(msgData.snippet || '');

        const isSignInAlert = /sign-in|signed in|new sign in|activation|code/i.test(subject) ||
          /signed in|new device/i.test(msgData.snippet || '');

        // Safe snippet with any sensitive OTPs or one-time URLs stripped
        const safeSnippet = sanitizeSnippet(msgData.snippet || '');

        return {
          id: item.id,
          threadId: item.threadId,
          sender,
          subject,
          date,
          snippet: safeSnippet,
          isHouseholdAlert,
          isSignInAlert,
          // Deep link allowing the user to securely open the message in their own Gmail inbox
          originalGmailUrl: `https://mail.google.com/mail/u/0/#inbox/${item.id}`,
        } as GmailNotificationMessage;
      } catch {
        return null;
      }
    })
  );

  return details.filter((m): m is GmailNotificationMessage => m !== null);
}
