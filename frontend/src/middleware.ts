import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;
  const role = request.cookies.get('userRole')?.value;

  // Protected portal routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isDoctorRoute = pathname.startsWith('/doctor');
  const isPatientRoute = pathname.startsWith('/patient');

  if (isAdminRoute || isDoctorRoute || isPatientRoute) {
    // If no token exists in cookies, let the client layout / redirect handle or redirect directly
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-specific restrictions
    if (isAdminRoute && role && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isDoctorRoute && role && role !== 'DOCTOR' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/patient/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/doctor/:path*',
    '/patient/:path*',
  ],
};
