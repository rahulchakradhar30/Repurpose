import { describe, it, expect } from 'vitest';
import { generateRIS, generateCSV } from '@/lib/export';
import { DrugConcept, RepurposingCandidate } from '@/types';

describe('Academic Citation & Dossier Exporter', () => {
  const mockDrug: DrugConcept = {
    genericName: 'Imatinib',
    brandNames: ['Gleevec'],
    rxNormId: '282388',
    approvedIndications: ['Chronic Myelogenous Leukemia (CML)'],
    warnings: ['Fluid retention', 'Hepatotoxicity'],
    contraindications: ['Hypersensitivity'],
    lastVerifiedDate: '2026-10-02',
    sources: [],
  };

  const mockCandidate: RepurposingCandidate = {
    id: 'cand-1',
    condition: 'Systemic Sclerosis',
    status: 'Investigational',
    highestPhase: 'Phase 2',
    evidenceScore: {
      clinicalTrialScore: 22,
      humanObservationalScore: 12,
      mechanisticScore: 18,
      reproducibilityScore: 8,
      safetyCompatibilityScore: 8,
      totalScore: 68,
      contributingFactors: ['Phase 2 completed study.'],
      uncertaintyFlags: ['Evidence is preliminary.'],
    },
    clinicalTrials: [
      {
        nctId: 'NCT00555555',
        title: 'Imatinib for Scleroderma Trial',
        phase: 'Phase 2',
        status: 'COMPLETED',
        conditions: ['Systemic Sclerosis'],
        leadSponsor: 'Johns Hopkins University',
        studyUrl: 'https://clinicaltrials.gov/study/NCT00555555',
        completionDate: '2018-05',
      },
    ],
    citations: [
      {
        pmid: '20345678',
        title: 'Safety and efficacy of imatinib in systemic sclerosis',
        journal: 'Arthritis & Rheumatology',
        pubDate: '2019',
        authors: ['Distler J', 'Muller O'],
        doi: '10.1002/art.12345',
        url: 'https://pubmed.ncbi.nlm.nih.gov/20345678/',
      },
    ],
    biologicalRationale: 'c-Abl and PDGFR inhibition preventing tissue fibrogenesis.',
    safetyNotes: [],
    sourceCount: 2,
  };

  it('generates valid RIS formatted records with correct tag syntax', () => {
    const ris = generateRIS(mockDrug, mockCandidate);
    expect(ris).toContain('TY  - JOUR');
    expect(ris).toContain('TI  - Safety and efficacy of imatinib in systemic sclerosis');
    expect(ris).toContain('AU  - Distler J');
    expect(ris).toContain('JO  - Arthritis & Rheumatology');
    expect(ris).toContain('UR  - https://pubmed.ncbi.nlm.nih.gov/20345678/');
    expect(ris).toContain('ER  - ');

    // Also includes trial records
    expect(ris).toContain('TY  - RPRT');
    expect(ris).toContain('RN  - NCT00555555');
  });

  it('generates CSV with required headers and properly escaped cells', () => {
    const csv = generateCSV(mockDrug, [mockCandidate]);
    expect(csv).toContain('Drug Generic Name,RxCUI,Drug Class,Candidate Condition');
    expect(csv).toContain('"Imatinib"');
    expect(csv).toContain('"Systemic Sclerosis"');
    expect(csv).toContain('"68"');
    expect(csv).toContain('"NCT00555555"');
    expect(csv).toContain('"20345678"');
  });
});
