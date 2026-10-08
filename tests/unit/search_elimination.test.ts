import { describe, it, expect } from 'vitest';
import { searchDrugDirectory } from '@/lib/drugDirectory';
import { searchRxNormAutocomplete } from '@/lib/sources/rxnorm';

describe('Search Autocomplete & Prefix Elimination Engine', () => {
  describe('Minimum 3-Character Constraint', () => {
    it('returns empty array when query is fewer than 3 characters', () => {
      expect(searchDrugDirectory('')).toEqual([]);
      expect(searchDrugDirectory('a')).toEqual([]);
      expect(searchDrugDirectory('me')).toEqual([]);
      expect(searchDrugDirectory('  th  ')).toEqual([]);
    });

    it('RxNorm autocomplete returns empty array for queries < 3 characters', async () => {
      const results1 = await searchRxNormAutocomplete('me');
      const results2 = await searchRxNormAutocomplete('  ');
      expect(results1).toEqual([]);
      expect(results2).toEqual([]);
    });
  });

  describe('Progressive Letter-by-Letter Elimination (Google/YouTube search style)', () => {
    it('progressively eliminates options from 3 to 4 to 5 characters for "met"', () => {
      // 3 letters: "met"
      const met3 = searchDrugDirectory('met');
      expect(met3.length).toBeGreaterThanOrEqual(4);
      const met3Names = met3.map((d) => d.name);
      expect(met3Names).toContain('Metformin');
      expect(met3Names).toContain('Methotrexate');

      // 4 letters: "meth" -> eliminates "Metformin", "Metoprolol", "Metronidazole"
      const meth4 = searchDrugDirectory('meth');
      expect(meth4.length).toBeLessThan(met3.length);
      const meth4Names = meth4.map((d) => d.name);
      expect(meth4Names).not.toContain('Metformin');
      expect(meth4Names).not.toContain('Metoprolol');
      expect(meth4Names).toContain('Methotrexate');
      expect(meth4Names).toContain('Methadone');

      // 5 letters: "metho" -> eliminates "Methadone", narrows down to "Methotrexate"
      const metho5 = searchDrugDirectory('metho');
      const metho5Names = metho5.map((d) => d.name);
      expect(metho5Names).toContain('Methotrexate');
      expect(metho5Names).not.toContain('Methadone');
      expect(metho5.length).toBe(1);
    });

    it('progressively eliminates options for "dox"', () => {
      // 3 letters: "dox"
      const dox3 = searchDrugDirectory('dox');
      const dox3Names = dox3.map((d) => d.name);
      expect(dox3Names).toContain('Doxorubicin');
      expect(dox3Names).toContain('Doxycycline');

      // 4 letters: "doxy" -> eliminates "Doxorubicin"
      const doxy4 = searchDrugDirectory('doxy');
      const doxy4Names = doxy4.map((d) => d.name);
      expect(doxy4Names).toContain('Doxycycline');
      expect(doxy4Names).not.toContain('Doxorubicin');

      // 4 letters: "doxo" -> eliminates "Doxycycline"
      const doxo4 = searchDrugDirectory('doxo');
      const doxo4Names = doxo4.map((d) => d.name);
      expect(doxo4Names).toContain('Doxorubicin');
      expect(doxo4Names).not.toContain('Doxycycline');
    });

    it('eliminates completely when no match exists', () => {
      const nonExistent = searchDrugDirectory('xyzq');
      expect(nonExistent).toEqual([]);
    });
  });

  describe('Brand Name Matching and Metadata', () => {
    it('matches proprietary brand names and links to generic name and RxCUI', () => {
      const zith = searchDrugDirectory('zith');
      expect(zith.length).toBeGreaterThan(0);
      const match = zith.find((d) => d.matchedTerm === 'Zithromax' || d.name === 'Azithromycin');
      expect(match).toBeDefined();
      expect(match?.genericName).toBe('Azithromycin');
      expect(match?.drugClass).toContain('Macrolide');
      expect(match?.rxcui).toBe('18631');
    });

    it('handles case-insensitivity and leading/trailing whitespace', () => {
      const upper = searchDrugDirectory('  MET  ');
      const lower = searchDrugDirectory('met');
      expect(upper.map((d) => d.name)).toEqual(lower.map((d) => d.name));
    });
  });
});
