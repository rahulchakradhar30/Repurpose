import { describe, it, expect } from 'vitest';
import { sanitizeDrugInput, checkRateLimit } from '@/lib/network';

describe('Input Validation & Network Protection', () => {
  it('sanitizes malicious or invalid characters in drug queries', () => {
    expect(sanitizeDrugInput('<script>alert("xss")</script>Metformin')).toBe('scriptalertxssscriptMetformin');
    expect(sanitizeDrugInput('  Aspirin 500mg -- extra  ')).toBe('Aspirin 500mg -- extra');
    expect(sanitizeDrugInput('Thalidomide; DROP TABLE drugs;')).toBe('Thalidomide DROP TABLE drugs');
  });

  it('truncates excessively long input queries to prevent payload abuse', () => {
    const hugeInput = 'A'.repeat(200);
    const sanitized = sanitizeDrugInput(hugeInput);
    expect(sanitized.length).toBeLessThanOrEqual(80);
  });

  it('rate limits consecutive requests according to defined threshold', () => {
    const key = `test_rate_limit_${Date.now()}`;
    const limit = 3;
    const windowMs = 5000;

    // Requests 1, 2, 3 should succeed
    expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true);
    expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true);
    expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true);

    // Request 4 should be throttled
    const fourth = checkRateLimit(key, limit, windowMs);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
    expect(fourth.resetMs).toBeGreaterThan(0);
  });
});
