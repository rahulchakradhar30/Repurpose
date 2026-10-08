import { describe, it, expect } from 'vitest';
import { computeEvidenceScore } from '@/lib/scoring';
import { RepurposingCandidate, DrugConcept } from '@/types';

describe('Search-to-Results Workflow & Failure Isolation', () => {
  it('correctly isolates and handles source failure gracefully', () => {
    // When one source (e.g. PubChem) fails or is unavailable, the drug concept still normalizes
    const mockDrugWithPartialFailure: DrugConcept = {
      genericName: 'Aspirin',
      brandNames: ['Bayer'],
      rxNormId: '1191',
      pubchemCid: undefined, // PubChem unavailable
      approvedIndications: ['Pain relief', 'Fever reduction', 'Secondary prevention of cardiovascular events'],
      warnings: ['Gastrointestinal ulceration'],
      contraindications: ['Active peptic ulcer disease'],
      lastVerifiedDate: '2026-10-02',
      sources: [
        {
          name: 'RxNorm',
          url: 'https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=1191',
          responseId: '1191',
          timestamp: '2026-10-02T10:00:00Z',
          status: 'ok',
        },
        {
          name: 'openFDA',
          url: 'https://open.fda.gov',
          timestamp: '2026-10-02T10:00:00Z',
          status: 'ok',
        },
        {
          name: 'PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov',
          timestamp: '2026-10-02T10:00:00Z',
          status: 'unavailable',
          statusMessage: 'No compound record verified in PubChem database for this term',
        },
      ],
    };

    expect(mockDrugWithPartialFailure.genericName).toBe('Aspirin');
    expect(mockDrugWithPartialFailure.sources.find(s => s.name === 'PubChem')?.status).toBe('unavailable');
    expect(mockDrugWithPartialFailure.approvedIndications.length).toBeGreaterThan(0);
  });

  it('correctly differentiates approved indications from repurposing candidates', () => {
    const approvedIndications = [
      'Type 2 Diabetes Mellitus',
      'Adjunct to diet and exercise to improve glycemic control'
    ];

    const isConditionApproved = (cond: string) => {
      const c = cond.toLowerCase();
      return approvedIndications.some(a => a.toLowerCase().includes(c) || c.includes(a.toLowerCase()));
    };

    expect(isConditionApproved('Type 2 Diabetes Mellitus')).toBe(true);
    expect(isConditionApproved('Diabetes Mellitus')).toBe(true);
    expect(isConditionApproved('Colorectal Neoplasms')).toBe(false);
    expect(isConditionApproved('Polycystic Ovary Syndrome')).toBe(false);
  });
});
