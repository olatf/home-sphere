import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const updateSession = async (req: NextRequest) => {
  const res = NextResponse.next();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedRoutes = ['/members-lounge', '/account', '/checkout'];
  const authPages = [
    '/sign-in',
    '/sign-up',
    '/verify-otp',
    '/complete-profile',
    '/forgot-password',
    '/reset-password',
  ];
  const onboardingPages = ['/verify-otp', '/complete-profile'];

  if (protectedRoutes.some(r => req.nextUrl.pathname.startsWith(r))) {
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  if (authPages.some(r => req.nextUrl.pathname.startsWith(r))) {
    if (user) {
      if (onboardingPages.some(r => req.nextUrl.pathname.startsWith(r))) {
        return res;
      }
      if (req.nextUrl.pathname.startsWith('/reset-password')) {
        return res;
      }
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
};
