import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js proxy to enforce SEO-safe indexing rules:
 * - Query parameter searches (?drug=... / ?candidate=...) remain fully functional for users
 *   and link sharing, but emit X-Robots-Tag: noindex, follow to prevent indexing duplicate search states.
 * - Static public routes (e.g. /drug/azithromycin) are preserved for indexing if publishable.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const searchParams = request.nextUrl.searchParams;

  // If user search or candidate query parameter is present, enforce noindex, follow
  if (searchParams.has('drug') || searchParams.has('candidate')) {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static assets)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.svg
     * - manifest.json
     * - robots.txt
     * - sitemap.xml
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json|robots.txt|sitemap.xml).*)',
  ],
};
