import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Updated middleware that allows the root page to handle session checking
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // ตรวจสอบ session cookie ทั้งของ production และ development
  const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                      request.cookies.get('__Secure-next-auth.session-token')?.value;
  
  // Exclude API routes and next-auth routes from middleware processing
  if (pathname.startsWith('/api/') || pathname.includes('/api/auth/')) {
    return NextResponse.next();
  }

  // Handle homepage route - direct to dashboard if session exists
  if (pathname === '/') {
    // ถ้ามี session ให้ไปหน้า dashboard เลย ไม่ต้องไปหน้า signin
    if (sessionToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // ถ้าไม่มี session ให้ไปหน้า signin
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }
  
  // Public routes that don't require authentication
  if (pathname.startsWith('/auth/') || pathname.includes('_next') || pathname.includes('favicon.ico')) {
    // ถ้ามี session อยู่แล้วและพยายามเข้าหน้า signin ให้เด้งไปหน้า dashboard เลย
    if (sessionToken && pathname === '/auth/signin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }
  
  // ถ้าเข้าหน้าที่ต้องล็อกอิน (เช่น dashboard) แต่ไม่มี session ให้เด้งไปหน้า signin
  if (pathname.startsWith('/dashboard') && !sessionToken) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Allow requests to proceed for now
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