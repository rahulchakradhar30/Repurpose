import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateNotebookPdfBlob,
  getStoredDriveToken,
  storeDriveToken,
  clearStoredDriveToken,
  DRIVE_TOKEN_KEY,
} from '@/lib/googleDrive';
import { NotebookDossierItem } from '@/lib/notebookStorage';

describe('Google Drive PDF Generation & Token Storage', () => {
  let mockSessionStore: Record<string, string> = {};
  let mockLocalStore: Record<string, string> = {};

  beforeEach(() => {
    mockSessionStore = {};
    mockLocalStore = {};

    // Mock window and web storage
    (global as unknown as { window: unknown }).window = {
      sessionStorage: {
        getItem: (k: string) => mockSessionStore[k] || null,
        setItem: (k: string, v: string) => { mockSessionStore[k] = v; },
        removeItem: (k: string) => { delete mockSessionStore[k]; },
      },
      localStorage: {
        getItem: (k: string) => mockLocalStore[k] || null,
        setItem: (k: string, v: string) => { mockLocalStore[k] = v; },
        removeItem: (k: string) => { delete mockLocalStore[k]; },
      },
    };
    (global as unknown as { sessionStorage: unknown }).sessionStorage = (global as unknown as { window: { sessionStorage: unknown } }).window.sessionStorage;
    (global as unknown as { localStorage: unknown }).localStorage = (global as unknown as { window: { localStorage: unknown } }).window.localStorage;
  });

  afterEach(() => {
    delete (global as unknown as { window?: unknown }).window;
    delete (global as unknown as { sessionStorage?: unknown }).sessionStorage;
    delete (global as unknown as { localStorage?: unknown }).localStorage;
  });

  const mockItems: NotebookDossierItem[] = [
    {
      id: 'metformin__longevity',
      drug: 'Metformin',
      condition: 'Age-Related Functional Decline',
      drugSlug: 'metformin',
      conditionSlug: 'longevity',
      score: 78,
      state: 'Pre-clinical',
      savedAt: '2026-10-01T12:00:00.000Z',
      notes: 'Investigating AMPK activation and mTOR downregulation pathways.',
      tags: ['geroscience', 'metabolic'],
      checklist: { 'Safety verified': true, 'Phase 3 planned': false },
    },
  ];

  it('generates a valid PDF blob with standard PDF 1.4 header and trailer', async () => {
    const blob = generateNotebookPdfBlob(mockItems, 'Dr. Smith');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');

    const text = await blob.text();
    expect(text).toContain('%PDF-1.4');
    expect(text).toContain('REPURPOSE RESEARCH NOTEBOOK');
    expect(text).toContain('Investigator: Dr. Smith');
    expect(text).toContain('METFORMIN');
    expect(text).toContain('AGE-RELATED FUNCTIONAL DECLINE');
    expect(text).toContain('Preserved permanently in Google Drive');
    expect(text).toContain('trailer');
    expect(text).toContain('%%EOF');
  });

  it('handles empty notebook items gracefully', async () => {
    const blob = generateNotebookPdfBlob([], 'Investigator');
    const text = await blob.text();
    expect(text).toContain('%PDF-1.4');
    expect(text).toContain('No active research dossiers');
  });

  it('manages Drive tokens correctly in storage', () => {
    expect(getStoredDriveToken()).toBeNull();

    storeDriveToken('test_access_token_xyz');
    expect(getStoredDriveToken()).toBe('test_access_token_xyz');
    expect(mockSessionStore[DRIVE_TOKEN_KEY]).toBe('test_access_token_xyz');
    expect(mockLocalStore[DRIVE_TOKEN_KEY]).toBe('test_access_token_xyz');

    clearStoredDriveToken();
    expect(getStoredDriveToken()).toBeNull();
    expect(mockSessionStore[DRIVE_TOKEN_KEY]).toBeUndefined();
    expect(mockLocalStore[DRIVE_TOKEN_KEY]).toBeUndefined();
  });
});
