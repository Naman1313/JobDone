import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('jobdone_token')?.value;
  
  // Public routes (no redirect)
  if (
    pathname.startsWith('/splash') || 
    pathname.startsWith('/onboarding') || 
    pathname.startsWith('/auth')
  ) {
    return NextResponse.next();
  }

  // Root path redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/splash', request.url));
  }

  // Determine user role locally from JWT
  let role = null;
  if (token) {
    try {
      // Decode JWT payload (local parse)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      role = payload.role;
    } catch (e) {
      // Invalid token format
      role = null;
    }
  }

  // Profile setup access (authenticated, no role)
  if (pathname.startsWith('/profile/setup')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    if (role === 'worker') {
      return NextResponse.redirect(new URL('/worker/home', request.url));
    }
    if (role === 'client') {
      return NextResponse.redirect(new URL('/client/home', request.url));
    }
    return NextResponse.next();
  }

  // Worker routes protection
  if (pathname.startsWith('/worker')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    if (role !== 'worker') {
      if (role === 'client') {
        return NextResponse.redirect(new URL('/client/home', request.url));
      }
      return NextResponse.redirect(new URL('/profile/setup', request.url));
    }
    return NextResponse.next();
  }

  // Client routes protection
  if (pathname.startsWith('/client')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    if (role !== 'client') {
      if (role === 'worker') {
        return NextResponse.redirect(new URL('/worker/home', request.url));
      }
      return NextResponse.redirect(new URL('/profile/setup', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (manifest, icons, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json).*)',
  ],
};
