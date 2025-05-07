import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = 
    path === '/login' || 
    path === '/' || 
    path.startsWith('/films') || 
    path.startsWith('/api') ||
    path.startsWith('/rentals');
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Redirect to login if trying to access a protected route without authentication
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect to appropriate page if trying to access login page with a token
  if (path === '/login' && token) {
    // Check if user is staff by looking at the user role in cookies
    const userRole = request.cookies.get('userRole')?.value;
    const username = request.cookies.get('username')?.value;

    if (userRole && (userRole === 'staff' || userRole === 'admin')) {
      return NextResponse.redirect(new URL('/staff/dashboard', request.url));
    }
    
    // Default redirect to home if not staff
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
