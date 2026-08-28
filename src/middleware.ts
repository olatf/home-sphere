import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const ADMIN_PREFIX = '/admin';
const PROTECTED_PREFIXES = ['/dashboard', '/onboarding', ADMIN_PREFIX];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // Refreshes the session cookie on every request — do this before any
  // other logic so it always runs, even for public pages.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(prefix =>
    path.startsWith(prefix)
  );

  if (!isProtected) return response;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('redirectTo', path);
    return NextResponse.redirect(url);
  }

  if (path.startsWith(ADMIN_PREFIX)) {
    const { data: isAdmin } = await supabase.rpc('is_admin');
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};
