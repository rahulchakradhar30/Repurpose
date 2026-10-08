import { describe, it, expect } from 'vitest';
import { isAllowedBiomedicalHost, fetchWithTimeoutAndRetry, ALLOWED_BIOMEDICAL_HOSTS } from '@/lib/network';

describe('Biomedical Source Host Allowlist & SSRF Protection', () => {
  it('allows verified official biomedical source hosts', () => {
    const validUrls = [
      'https://clinicaltrials.gov/api/v2/studies?query.intr=metformin',
      'https://api.fda.gov/drug/label.json?search=metformin',
      'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/metformin/cids/JSON',
      'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed',
      'https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=metformin',
      'https://identitytoolkit.googleapis.com/v1/accounts',
      'https://api.groq.com/openai/v1/chat/completions',
      'https://generativelanguage.googleapis.com/v1beta/models',
    ];

    for (const url of validUrls) {
      expect(isAllowedBiomedicalHost(url)).toBe(true);
    }
  });

  it('rejects unauthorized external hosts, local IP addresses, and metadata endpoints (SSRF protection)', () => {
    const maliciousUrls = [
      'http://evil-attacker.com/malicious-endpoint',
      'https://169.254.169.254/latest/meta-data/', // AWS/GCP Cloud instance metadata
      'http://192.168.1.1/admin',                  // Internal router / subnet
      'http://10.0.0.1/private-api',               // Private IP space
      'https://webhook.site/test-exfil',
      'ftp://clinicaltrials.gov/exploit',
      'http://internal-database.local:5432/',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
    ];

    for (const url of maliciousUrls) {
      expect(isAllowedBiomedicalHost(url)).toBe(false);
    }
  });

  it('throws security error when attempting outbound fetch to an unauthorized host', async () => {
    const blockedUrl = 'https://unauthorized-domain.org/data';
    
    await expect(fetchWithTimeoutAndRetry(blockedUrl, { retries: 0 })).rejects.toThrow(
      /Security Violation: Outbound request to unauthorized host/
    );
  });
});
