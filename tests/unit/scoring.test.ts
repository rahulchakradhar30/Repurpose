import { describe, it, expect } from 'vitest';
import { computeEvidenceScore } from '@/lib/scoring';
import { ClinicalTrial, PubMedCitation } from '@/types';

describe('Evidence Scoring Engine', () => {
  it('assigns high clinical trial score for Phase 4 / Phase 3 completed trials', () => {
    const trials: ClinicalTrial[] = [
      {
        nctId: 'NCT01234567',
        title: 'Phase 3 Evaluation of Candidate',
        phase: 'PHASE 3',
        status: 'COMPLETED',
        conditions: ['Metabolic Syndrome'],
        leadSponsor: 'Academic Medical Center',
        studyUrl: 'https://clinicaltrials.gov/study/NCT01234567',
      },
      {
        nctId: 'NCT07654321',
        title: 'Phase 3 Confirmatory Multi-Center Study',
        phase: 'PHASE 3',
        status: 'ACTIVE_NOT_RECRUITING',
        conditions: ['Metabolic Syndrome'],
        leadSponsor: 'University Health System',
        studyUrl: 'https://clinicaltrials.gov/study/NCT07654321',
      }
    ];

    const citations: PubMedCitation[] = [
      {
        pmid: '12345678',
        title: 'Efficacy in Metabolic Syndrome',
        journal: 'Lancet',
        pubDate: '2023',
        authors: ['Smith J', 'Doe A'],
        url: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
      },
      {
        pmid: '87654321',
        title: 'Randomized Trial Outcomes',
        journal: 'NEJM',
        pubDate: '2024',
        authors: ['Taylor R'],
        url: 'https://pubmed.ncbi.nlm.nih.gov/87654321/',
      },
    ];

    const score = computeEvidenceScore({
      condition: 'Metabolic Syndrome',
      trials,
      citations,
      mechanismOfAction: 'Inhibition of hepatic gluconeogenesis and activation of AMP-activated protein kinase pathway.',
      biologicalRationale: 'Extensive biochemical target engagement with metabolic pathways.',
    });

    expect(score.clinicalTrialScore).toBeGreaterThanOrEqual(35);
    expect(score.clinicalTrialScore).toBeLessThanOrEqual(40);
    expect(score.humanObservationalScore).toBe(12); // 2 citations
    expect(score.reproducibilityScore).toBe(10); // 2 distinct sponsors
    expect(score.totalScore).toBeGreaterThan(60);
    expect(score.totalScore).toBeLessThanOrEqual(100);
  });

  it('heavily penalizes candidate when all clinical trials were terminated or withdrawn', () => {
    const trials: ClinicalTrial[] = [
      {
        nctId: 'NCT99999999',
        title: 'Terminated Pilot Study',
        phase: 'PHASE 2',
        status: 'TERMINATED',
        conditions: ['Acute Pancreatitis'],
        leadSponsor: 'Pharma Sponsor',
        studyUrl: 'https://clinicaltrials.gov/study/NCT99999999',
      }
    ];

    const score = computeEvidenceScore({
      condition: 'Acute Pancreatitis',
      trials,
      citations: [],
    });

    expect(score.clinicalTrialScore).toBeLessThanOrEqual(5);
    expect(score.uncertaintyFlags).toContain('Trial stopped: All identified clinical trials were prematurely terminated or withdrawn.');
  });

  it('applies safety penalty when FDA contraindications match candidate condition', () => {
    const score = computeEvidenceScore({
      condition: 'Renal Impairment',
      trials: [],
      citations: [],
      fdaContraindications: ['Contraindicated in severe renal impairment (eGFR < 30 mL/min).'],
    });

    expect(score.safetyCompatibilityScore).toBe(1);
    expect(score.uncertaintyFlags.some(f => f.includes('Safety alert: Official FDA label explicitly lists this condition'))).toBe(true);
  });

  it('handles zero trials and zero citations with explicit preliminary uncertainty flags', () => {
    const score = computeEvidenceScore({
      condition: 'Novel Hypothesis',
      trials: [],
      citations: [],
      mechanismOfAction: '',
    });

    expect(score.clinicalTrialScore).toBe(0);
    expect(score.humanObservationalScore).toBe(0);
    expect(score.uncertaintyFlags).toContain('No registered interventional clinical trials found for this candidate condition.');
    expect(score.uncertaintyFlags).toContain('Human evidence unavailable: No peer-reviewed PubMed citations indexed for this specific pairing.');
  });
});
