import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { hasPermission, type Role } from '@/lib/accessPolice';

export const updateSession = async (request: NextRequest) => {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: cookiesToSet => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const authPages = [
    '/sign-in',
    '/sign-up',
    '/verify-otp',
    '/forgot-password',
    '/reset-password',
    '/set-password',
  ];

  const protectedRoutes = ['/dashboard', '/admin', '/onboarding'];

  const isAuthPage = authPages.some(p => pathname.startsWith(p));
  const isProtected = protectedRoutes.some(p => pathname.startsWith(p));

  // Allow callback
  if (pathname.startsWith('/auth/callback')) {
    return response;
  }

  // Not logged in
  if (!user) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      return NextResponse.redirect(url);
    }

    return response;
  }

  // Logged in → fetch profile + role ONCE
  const [{ data: profile }, { data: userRole }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('is_email_verified, onboarding_completed')
      .eq('id', user.id)
      .single(),
    supabase.from('user_roles').select('role').eq('user_id', user.id).single(),
  ]);

  if (!profile) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-up';
    return NextResponse.redirect(url);
  }

  const role = userRole?.role as Role | undefined;

  const isAdmin =
    role &&
    (hasPermission(role, 'admin:access') ||
      hasPermission(role, 'superAdmin:access') ||
      hasPermission(role, 'administrator:access'));

  // Enforce onboarding
  if (
    !profile.onboarding_completed &&
    profile.is_email_verified &&
    !pathname.startsWith('/onboarding')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/onboarding';
    return NextResponse.redirect(url);
  }

  // Prevent completed users from revisiting onboarding
  if (profile.onboarding_completed && pathname.startsWith('/onboarding')) {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? '/admin' : '/dashboard';
    return NextResponse.redirect(url);
  }

  // Block auth pages for logged-in users

  if (isAuthPage) {
    if (
      pathname.startsWith('/reset-password') &&
      request.nextUrl.searchParams.get('email') &&
      request.cookies.getAll().some(c => c.name.startsWith('sb-'))
    ) {
      return response;
    }

    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? '/admin' : '/dashboard';
    return NextResponse.redirect(url);
  }

  // Protect admin route
  if (pathname.startsWith('/admin') && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
};
