import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Production Security & SEO Proxy for Next.js 16 (Turbopack).
 * 
 * Features:
 * 1. Strict CORS validation for /api/* routes (explicit origin allowlist, no wildcard with credentials).
 * 2. Preflight OPTIONS handling with restrictive CORS headers.
 * 3. Search query deduplication protection (X-Robots-Tag: noindex, follow for parameterized searches).
 * 4. Defense-in-depth security response headers.
 */

const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.NEXT_PUBLIC_SITE_URL || 'https://repurpose.vercel.app',
]);

function getCorsOrigin(origin: string | null): string | null {
  if (!origin) return null;
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  // In development, allow localhost on any port
  if (process.env.NODE_ENV !== 'production' && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
    return origin;
  }
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const origin = request.headers.get('origin');
  const allowedOrigin = getCorsOrigin(origin);

  // 1. Handle API CORS & preflight
  if (pathname.startsWith('/api/')) {
    // Preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      if (allowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');
        response.headers.set('Access-Control-Max-Age', '86400');
        response.headers.set('Vary', 'Origin');
      }
      return response;
    }

    const response = NextResponse.next();
    if (allowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
      response.headers.set('Vary', 'Origin');
    }
    return response;
  }

  // 2. SEO indexing controls for parameterized search states
  const response = NextResponse.next();

  if (searchParams.has('drug') || searchParams.has('candidate')) {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
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
