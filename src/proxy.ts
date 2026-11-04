import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Production Security, Rate Limiting & SEO Proxy for Next.js 16 (Turbopack).
 * 
 * Features:
 * 1. Strict CORS validation for /api/* routes (explicit origin allowlist, no wildcard with credentials).
 * 2. Preflight OPTIONS handling with restrictive CORS headers.
 * 3. Edge sliding-window IP rate limiting for /api/* (60 req/min) and dynamic exploration /drug/*, /compare (120 req/min).
 * 4. Root path ('/') and static assets are explicitly exempt from rate limiting to guarantee 100% availability.
 * 5. Search query deduplication protection (X-Robots-Tag: noindex, follow for parameterized searches).
 */

const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.NEXT_PUBLIC_SITE_URL || 'https://drugrepurpose.vercel.app',
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

// Sliding window in-memory rate limiting map for edge / serverless instances
interface WindowEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, WindowEntry>();

function cleanExpiredEntries() {
  const now = Date.now();
  if (rateLimitMap.size > 5000) {
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const origin = request.headers.get('origin');
  const allowedOrigin = getCorsOrigin(origin);

  // 1. Handle API CORS & preflight OPTIONS
  if (pathname.startsWith('/api/')) {
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
  }

  // 2. Sliding window IP Rate Limiting for dynamic routes (/api, /drug, /compare)
  // Root path ('/') and static assets are strictly bypassed
  const isApiRoute = pathname.startsWith('/api');
  const isDynamicRoute = isApiRoute || pathname.startsWith('/drug') || pathname === '/compare';

  if (isDynamicRoute && pathname !== '/') {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const limit = isApiRoute ? 60 : 120;
    const windowMs = 60 * 1000;
    const now = Date.now();

    cleanExpiredEntries();

    const key = `${ip}:${isApiRoute ? 'api' : 'dynamic'}`;
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
    } else if (entry.count >= limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please wait before making additional requests.',
          retryAfterSeconds: retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.max(1, retryAfter)),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
            ...(allowedOrigin ? { 'Access-Control-Allow-Origin': allowedOrigin } : {}),
          },
        }
      );
    } else {
      entry.count += 1;
    }
  }

  // 3. Prepare response with CORS headers if needed
  const response = NextResponse.next();

  if (pathname.startsWith('/api/') && allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Vary', 'Origin');
  }

  // 4. SEO indexing controls for parameterized search states
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
