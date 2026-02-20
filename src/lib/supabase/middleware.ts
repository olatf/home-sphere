import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { hasPermission, type Role } from '@/lib/accessPolice';

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authPages = [
    '/sign-in',
    '/sign-up',
    '/verify-otp',
    '/forgot-password',
    '/reset-password',
    '/set-password',
  ];

  const protectedRoutes = ['/dashboard', '/onboarding', '/admin'];

  const pathname = request.nextUrl.pathname;

  const isAuthPage = authPages.some(page => pathname.startsWith(page));
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Allow OAuth callback to complete without any checks
  if (pathname.startsWith('/auth/callback')) return supabaseResponse;

  // If accessing a protected route without authentication, redirect to sign-in
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  // If no user and not accessing protected route or auth page, allow access (public routes)
  if (!user) return supabaseResponse;

  // If authenticated user tries to access auth pages, redirect according to role
  // but allow temporary access to /reset-password when session/cookies exist
  if (isAuthPage) {
    if (
      pathname.startsWith('/reset-password') &&
      request.nextUrl.searchParams.get('email') &&
      request.cookies.getAll().some(c => c.name.startsWith('sb-'))
    ) {
      return supabaseResponse;
    }

    // fetch profile to determine role so we can route admins to admin dashboard
    const { data: profile } = await supabase
      .from('users_role')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = '/sign-up';
      return NextResponse.redirect(url);
    }

    if (profile?.role as Role | null | undefined) {
      const isAdmin =
        hasPermission(profile.role as Role, 'admin:access') ||
        hasPermission(profile.role as Role, 'superAdmin:access') ||
        hasPermission(profile.role as Role, 'administrator:access');

      const isTenant = hasPermission(profile.role as Role, 'tenant:access');

      if (isTenant) {
        const url = request.nextUrl.clone();
        url.pathname = '/tenant';
        return NextResponse.redirect(url);
      }
      const isLandlord = hasPermission(profile.role as Role, 'landlord:access');

      if (isLandlord) {
        const url = request.nextUrl.clone();
        url.pathname = '/landlord';
        return NextResponse.redirect(url);
      }
      if (isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
      }
    } else {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Only check profile and onboarding status for protected routes
  if (!isProtectedRoute) return supabaseResponse;

  // User has session and accessing protected route - check profile and onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name,is_email_verified,onboarding_completed,role')
    .eq('id', user.id)
    .single();

  // If user has session but no profile, redirect to sign-up
  if (!profile) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-up';
    return NextResponse.redirect(url);
  }

  // If user has session and profile but onboarding incomplete, redirect to onboarding
  if (!profile.onboarding_completed && profile.is_email_verified) {
    const url = request.nextUrl.clone();
    url.pathname = '/onboarding';
    return NextResponse.redirect(url);
  }

  // Otherwise allow the request
  return supabaseResponse;
};
