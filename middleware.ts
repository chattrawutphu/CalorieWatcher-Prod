import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware that redirects root to dashboard
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Exclude API routes from middleware processing
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Handle homepage route - direct to dashboard for all users
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Allow all other requests to proceed
  return NextResponse.next();
}

// Specify the paths that this middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 