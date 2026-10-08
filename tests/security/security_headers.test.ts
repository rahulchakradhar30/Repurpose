import { describe, it, expect } from 'vitest';
import nextConfig from '../../next.config';

describe('Production Security Headers & Configuration (OWASP ASVS Level 1)', () => {
  it('disables X-Powered-By header to prevent technology fingerprinting', () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it('disables production browser source maps to prevent source code exposure', () => {
    expect(nextConfig.productionBrowserSourceMaps).toBe(false);
  });

  it('configures mandatory security headers for all routes', async () => {
    expect(typeof nextConfig.headers).toBe('function');
    if (!nextConfig.headers) return;

    const headersConfig = await nextConfig.headers();
    expect(Array.isArray(headersConfig)).toBe(true);

    const rootConfig = headersConfig.find(h => h.source === '/:path*');
    expect(rootConfig).toBeDefined();

    const headerMap = new Map<string, string>();
    for (const item of rootConfig?.headers || []) {
      headerMap.set(item.key.toLowerCase(), item.value);
    }

    // 1. Strict Transport Security (HSTS)
    const hsts = headerMap.get('strict-transport-security');
    expect(hsts).toBeDefined();
    expect(hsts).toContain('max-age=63072000');
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).toContain('preload');

    // 2. Clickjacking Protection
    expect(headerMap.get('x-frame-options')).toBe('DENY');

    // 3. MIME Sniffing Protection
    expect(headerMap.get('x-content-type-options')).toBe('nosniff');

    // 4. Referrer Policy
    expect(headerMap.get('referrer-policy')).toBe('strict-origin-when-cross-origin');

    // 5. Restrictive Permissions Policy
    const permPolicy = headerMap.get('permissions-policy');
    expect(permPolicy).toBeDefined();
    expect(permPolicy).toContain('camera=()');
    expect(permPolicy).toContain('geolocation=()');
    expect(permPolicy).toContain('payment=()');

    // 6. Content Security Policy (CSP)
    const csp = headerMap.get('content-security-policy');
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("clinicaltrials.gov");
    expect(csp).toContain("api.fda.gov");
    expect(csp).toContain("identitytoolkit.googleapis.com");
  });
});
