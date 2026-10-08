import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Firestore Production Security Rules Verification', () => {
  const rulesPath = path.resolve(__dirname, '../../firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  it('uses rules_version = 2', () => {
    expect(rulesContent).toContain("rules_version = '2'");
  });

  it('enforces deny-by-default for all unspecified collections', () => {
    expect(rulesContent).toMatch(/match\s*\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*false;\s*\}/);
  });

  it('strictly isolates user directory to authenticated owner only', () => {
    expect(rulesContent).toContain('function isOwner(userId)');
    expect(rulesContent).toContain('request.auth.uid == userId');
    expect(rulesContent).toContain('allow read, write: if isOwner(userId);');
  });

  it('validates saved drug schema, owner ID immutability, and length bounds', () => {
    expect(rulesContent).toContain('function isValidSavedDrug(data, userId)');
    expect(rulesContent).toContain('data.userId == userId');
    expect(rulesContent).toContain('data.drugGenericName is string');
    expect(rulesContent).toContain('data.drugGenericName.size() <= 100');
    expect(rulesContent).toContain('data.notes.size() <= 50000');
  });

  it('explicitly denies client read/write to protected system collections', () => {
    const protectedCollections = [
      '/verified_drugs/{doc=**}',
      '/evidence_cache/{doc=**}',
      '/scores/{doc=**}',
      '/admin/{doc=**}',
      '/audit_logs/{doc=**}',
    ];

    for (const col of protectedCollections) {
      expect(rulesContent).toContain(`match ${col}`);
    }
  });
});
