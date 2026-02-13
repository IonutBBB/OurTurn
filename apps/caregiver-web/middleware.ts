import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip auth for static locale files served from /public/locales/
  if (request.nextUrl.pathname.startsWith('/locales/')) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     * - API routes (handled by their own auth checks)
     */
    '/((?!_next/static|_next/image|favicon.ico|locales/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$|api/).*)',
  ],
};
