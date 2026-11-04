/**
 * Distributed Cache & Rate-Controlled Dispatch Layer
 * Supports Upstash Redis / Vercel KV REST APIs with graceful fallback to a global singleton cache.
 * Enforces NCBI E-Utilities quota rules (<= 3 req/sec without API key, <= 10 req/sec with API key).
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// Global singleton cache so in-memory state survives module reload in long-running processes
const globalCache = (globalThis as unknown as {
  __repurposeMemoryCache?: Map<string, CacheEntry<unknown>>;
});

if (!globalCache.__repurposeMemoryCache) {
  globalCache.__repurposeMemoryCache = new Map<string, CacheEntry<unknown>>();
}

const memoryStore = globalCache.__repurposeMemoryCache;

function getRedisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (url && token) {
    return { url: url.replace(/\/+$/, ''), token };
  }
  return null;
}

/**
 * Retrieves a value from persistent distributed cache (Redis/KV) or in-memory singleton fallback.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedisConfig();

  if (redis) {
    try {
      const res = await fetch(`${redis.url}/get/${encodeURIComponent(key)}`, {
        headers: {
          Authorization: `Bearer ${redis.token}`,
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.result !== null && data.result !== undefined) {
          try {
            return JSON.parse(data.result) as T;
          } catch {
            return data.result as T;
          }
        }
      }
    } catch (err) {
      console.warn(`Distributed cache read error for key "${key}", falling back to memory:`, err);
    }
  }

  // Fallback to in-memory singleton
  const entry = memoryStore.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }

  return entry.value as T;
}

/**
 * Stores a value in persistent distributed cache (Redis/KV) and in-memory singleton fallback.
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = 21600 // default 6 hours
): Promise<void> {
  const redis = getRedisConfig();
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);

  // Store in memory singleton
  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  if (redis) {
    try {
      await fetch(
        `${redis.url}/set/${encodeURIComponent(key)}/${encodeURIComponent(serialized)}?ex=${ttlSeconds}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${redis.token}`,
          },
          cache: 'no-store',
        }
      );
    } catch (err) {
      console.warn(`Distributed cache write error for key "${key}":`, err);
    }
  }
}

/**
 * Transparent cache-aside wrapper.
 */
export async function cacheWrap<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const fresh = await fetcher();
  if (fresh !== null && fresh !== undefined) {
    await cacheSet(key, fresh, ttlSeconds);
  }
  return fresh;
}

/**
 * NCBI Rate-Controlled Dispatch Queue
 * Guarantees outbound requests to eutils.ncbi.nlm.nih.gov adhere strictly to NCBI limits:
 * - 3 requests/sec without API key (delay >= 350ms)
 * - 10 requests/sec with NCBI_API_KEY (delay >= 110ms)
 */
class NcbiRateLimiter {
  private queue: Array<() => void> = [];
  private isProcessing = false;
  private lastDispatchTime = 0;

  private getMinIntervalMs(): number {
    return process.env.NCBI_API_KEY ? 110 : 350;
  }

  public async dispatch<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const minInterval = this.getMinIntervalMs();
      const elapsed = Date.now() - this.lastDispatchTime;
      const waitTime = Math.max(0, minInterval - elapsed);

      if (waitTime > 0) {
        await new Promise((r) => setTimeout(r, waitTime));
      }

      const task = this.queue.shift();
      this.lastDispatchTime = Date.now();

      if (task) {
        try {
          await task();
        } catch {
          // Individual task errors are handled by promise rejection in dispatch
        }
      }
    }

    this.isProcessing = false;
  }
}

export const ncbiRateLimiter = new NcbiRateLimiter();
