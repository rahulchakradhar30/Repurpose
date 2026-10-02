/**
 * Resilient HTTP client utilities for public biomedical APIs.
 * Includes timeout control, exponential backoff retries, and in-memory rate limiting.
 */

// Simple in-memory sliding window rate limiter
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(key: string, limit: number = 30, windowMs: number = 60_000): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Remove timestamps outside window
  record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
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
}

export async function fetchWithTimeoutAndRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeoutMs = 8000,
    retries = 2,
    retryDelayMs = 500,
    ...fetchOptions
  } = options;

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
          'User-Agent': 'RepurposeBiomedicalResearch/1.0 (educational-research; contact: researcher@repurpose.edu)',
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

export function sanitizeDrugInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  // Trim, keep alphabetic, numeric, hyphens, and spaces commonly found in drug names
  return input
    .trim()
    .replace(/[^\w\s-]/g, '')
    .slice(0, 80);
}
