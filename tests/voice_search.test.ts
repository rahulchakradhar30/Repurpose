import { describe, it, expect } from 'vitest';
import { sanitizeDrugInput } from '@/lib/network';
import { searchDrugDirectory, findFuzzyDrugCorrection } from '@/lib/drugDirectory';

describe('Voice Search Transcript Processing & Integration', () => {
  it('cleans trailing punctuation common in speech recognition engines', () => {
    const rawSpeechOutputs = [
      'Metformin.',
      'Azithromycin?',
      'Thalidomide!',
      '   Aspirin,   ',
      'Imatinib...',
    ];

    const cleaned = rawSpeechOutputs.map((raw) =>
      raw.trim().replace(/[.,?!]+$/, '')
    );

    expect(cleaned).toEqual([
      'Metformin',
      'Azithromycin',
      'Thalidomide',
      'Aspirin',
      'Imatinib',
    ]);
  });

  it('voice transcribed drug names match directly in the drug directory', () => {
    const spokenDrugs = ['Metformin', 'Azithromycin', 'Thalidomide', 'Aspirin', 'Doxycycline'];

    for (const drug of spokenDrugs) {
      const sanitized = sanitizeDrugInput(drug);
      const matches = searchDrugDirectory(sanitized);
      expect(matches.length).toBeGreaterThan(0);
      const exactMatch = matches.find((m) => m.name.toLowerCase() === drug.toLowerCase());
      expect(exactMatch).toBeDefined();
    }
  });

  it('voice transcribed prefixes trigger immediate elimination suggestions', () => {
    const spokenPrefix = 'dox';
    const matches = searchDrugDirectory(spokenPrefix);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.map((m) => m.name)).toContain('Doxycycline');
    expect(matches.map((m) => m.name)).toContain('Doxorubicin');
  });

  it('corrects voice pronunciation and spelling errors to closest drug matches', () => {
    // "metformen" -> Metformin
    const metformen = findFuzzyDrugCorrection('metformen');
    expect(metformen).not.toBeNull();
    expect(metformen?.genericName).toBe('Metformin');

    // "talidomide" -> Thalidomide
    const talidomide = findFuzzyDrugCorrection('talidomide');
    expect(talidomide).not.toBeNull();
    expect(talidomide?.genericName).toBe('Thalidomide');

    // "asithromycin" -> Azithromycin
    const asithromycin = findFuzzyDrugCorrection('asithromycin');
    expect(asithromycin).not.toBeNull();
    expect(asithromycin?.genericName).toBe('Azithromycin');

    // "doxycyclin" -> Doxycycline
    const doxycyclin = findFuzzyDrugCorrection('doxycyclin');
    expect(doxycyclin).not.toBeNull();
    expect(doxycyclin?.genericName).toBe('Doxycycline');

    // "aspiran" -> Aspirin
    const aspiran = findFuzzyDrugCorrection('aspiran');
    expect(aspiran).not.toBeNull();
    expect(aspiran?.genericName).toBe('Aspirin');
  });

  it('maps spoken brand pronunciation variants to their generic counterparts', () => {
    // "zitromax" -> Azithromycin (brand: Zithromax)
    const zitromax = findFuzzyDrugCorrection('zitromax');
    expect(zitromax).not.toBeNull();
    expect(zitromax?.genericName).toBe('Azithromycin');
    expect(zitromax?.matchedTerm).toBe('Zithromax');
  });
});
