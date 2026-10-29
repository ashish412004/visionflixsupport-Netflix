import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const AUTHORIZED_ADMIN_EMAIL = 'hhshukla241099@gmail.com';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Completely block and redirect public registration
  if (pathname === '/register' || pathname.startsWith('/register/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('notice', 'invitation_only');
    return NextResponse.redirect(url);
  }

  // 2. Prepare Supabase Client for Session Validation
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const isAdminUser = Boolean(
    user && user.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()
  );

  // 3. Admin Login page (/admin)
  if (pathname === '/admin') {
    // If already authenticated as administrator, redirect directly to admin dashboard
    if (isAdminUser) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/dashboard';
      return NextResponse.redirect(url);
    }
    // Otherwise allow viewing the dedicated admin login form at /admin
    return response;
  }

  // 4. Protect all /admin/* sub-routes
  if (pathname.startsWith('/admin/')) {
    // If not signed in at all, redirect to /admin login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }

    // If signed in but NOT the authorized administrator, reject with 403 or redirect to /admin?error=unauthorized
    if (!isAdminUser) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/register',
    '/register/:path*',
  ],
};
