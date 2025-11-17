import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySimpleAuth, extractAuthFromUrl } from '@/lib/auth/simple';

// Routes that require authentication
const protectedRoutes = ['/workspace'];

// Routes that are public (no auth required)
const publicRoutes = ['/api/webhooks'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if route needs authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    console.log('🛡️  Protected route accessed:', pathname);

    // Try to get auth params from URL
    const { userId: userIdFromUrl, emailHash: emailHashFromUrl } = extractAuthFromUrl(request.url);
    console.log('🔍 Auth from URL:', userIdFromUrl ? `userId: ${userIdFromUrl}, emailHash: ${emailHashFromUrl?.substring(0, 10)}...` : 'none');

    // Try to get auth from cookies
    const userIdFromCookie = request.cookies.get('auth-user-id')?.value;
    const emailHashFromCookie = request.cookies.get('auth-email-hash')?.value;
    console.log('🔍 Auth from cookie:', userIdFromCookie ? `userId: ${userIdFromCookie}` : 'none');

    const userId = userIdFromUrl || userIdFromCookie;
    const emailHash = emailHashFromUrl || emailHashFromCookie;

    if (!userId || !emailHash) {
      console.error('❌ Missing authentication parameters');
      return NextResponse.json(
        { error: 'Authentication required - missing userId or emailHash' },
        { status: 401 }
      );
    }

    console.log('🔍 Full URL:', request.url);

    // Verify authentication
    const payload = await verifySimpleAuth(userId, emailHash);

    if (!payload) {
      console.error('❌ Authentication verification failed - returning 401');
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    console.log('✅ Authentication verified successfully:', payload);

    // If auth came from URL and not in cookies, set cookies and redirect
    if (userIdFromUrl && emailHashFromUrl && (!userIdFromCookie || !emailHashFromCookie)) {
      console.log('💾 Setting cookies and redirecting to clean URL...');

      // Redirect to clean URL without auth parameters
      const url = request.nextUrl.clone();
      url.searchParams.delete('userId');
      url.searchParams.delete('emailHash');

      const response = NextResponse.redirect(url);

      // Set cookies for 24 hours
      response.cookies.set('auth-user-id', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      response.cookies.set('auth-email-hash', emailHash, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      // Add user info to request headers
      response.headers.set('x-user-id', payload.userId);
      response.headers.set('x-user-email', payload.email);

      return response;
    }

    // Auth came from cookies, just continue
    const response = NextResponse.next();

    // Add user info to request headers
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-email', payload.email);

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
