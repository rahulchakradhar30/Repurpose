/**
 * Resilient & Secure HTTP client utilities for public biomedical APIs.
 * Enforces SSRF host allowlists, timeout control, exponential backoff retries,
 * safe sliding window rate limiting, and strict input validation.
 */

import { logSecurityEvent } from './securityLogger';

// Approved biomedical source host allowlist (SSRF Protection)
export const ALLOWED_BIOMEDICAL_HOSTS = new Set([
  'clinicaltrials.gov',
  'api.fda.gov',
  'dailymed.nlm.nih.gov',
  'pubchem.ncbi.nlm.nih.gov',
  'eutils.ncbi.nlm.nih.gov',
  'pubmed.ncbi.nlm.nih.gov',
  'rxnav.nlm.nih.gov',
  'mor.nlm.nih.gov',
  'api.groq.com',
  'generativelanguage.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firestore.googleapis.com',
]);

// Sliding window in-memory rate limiter with periodic cleanup
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const MAX_RATE_LIMIT_KEYS = 10_000;

// Periodic cleanup to avoid unbounded memory growth
function cleanupExpiredRateLimits(windowMs: number) {
  const now = Date.now();
  if (rateLimitStore.size > MAX_RATE_LIMIT_KEYS) {
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }
}

export function checkRateLimit(
  key: string, 
  limit: number = 30, 
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  cleanupExpiredRateLimits(windowMs);

  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Remove timestamps outside window
  record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    
    logSecurityEvent({
      eventType: 'RATE_LIMIT_EXCEEDED',
      details: { key, limit, windowMs, resetMs },
    });

    return { allowed: false, remaining: 0, resetMs };
  }

  record.timestamps.push(now);
  rateLimitStore.set(key, record);

  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    resetMs: windowMs,
  };
}

export interface FetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  bypassAllowlist?: boolean; // Only for local mock testing in test environment
}

export function isAllowedBiomedicalHost(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    
    // In automated testing, localhost is allowed for local test endpoints
    if (process.env.NODE_ENV === 'test' && (host === 'localhost' || host === '127.0.0.1')) {
      return true;
    }

    return ALLOWED_BIOMEDICAL_HOSTS.has(host);
  } catch {
    return false;
  }
}

export async function fetchWithTimeoutAndRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeoutMs = 8000,
    retries = 2,
    retryDelayMs = 500,
    bypassAllowlist = false,
    ...fetchOptions
  } = options;

  // 1. SSRF Protection: Validate host against strict biomedical allowlist
  if (!bypassAllowlist && !isAllowedBiomedicalHost(url)) {
    let hostname = 'invalid';
    try {
      hostname = new URL(url).hostname;
    } catch {
      // ignore
    }

    logSecurityEvent({
      eventType: 'SSRF_ATTEMPT_BLOCKED',
      details: { attemptedUrl: url, attemptedHost: hostname },
    });

    throw new Error(`Security Violation: Outbound request to unauthorized host '${hostname}' is blocked.`);
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RepurposeBiomedicalResearch/1.0 (educational-research; contact: security@repurpose-research.org)',
          ...(fetchOptions.headers || {}),
        },
      });

      clearTimeout(timeoutId);

      // Retry on 502, 503, 504, 429
      if ([429, 502, 503, 504].includes(response.status) && attempt < retries) {
        const delay = retryDelayMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      return response;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      lastError = err;

      if (attempt < retries) {
        const delay = retryDelayMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError || new Error(`Network request failed for ${url}`);
}

/**
 * Strict sanitization for drug search input.
 * Strips script tags, SQL/shell meta-characters, limits length to 80 chars.
 */
export function sanitizeDrugInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Trim, remove control characters and dangerous symbols
  const cleaned = input
    .trim()
    .replace(/[^\w\s.-]/g, '')
    .slice(0, 80);

  if (input.length > 80 || /[<>{}[\]\\;/]/.test(input)) {
    logSecurityEvent({
      eventType: 'INVALID_INPUT_DETECTED',
      details: { rawLength: input.length, sanitized: cleaned },
    });
  }

  return cleaned;
}

/**
 * Strict validator for disease / condition query strings.
 */
export function sanitizeConditionInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[^\w\s.,'()-]/g, '')
    .slice(0, 100);
}

