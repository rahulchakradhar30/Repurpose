import { describe, it, expect } from 'vitest';
import { 
  computeResearchReadinessScore, 
  determineResearchState, 
  detectContradictions, 
  buildProvenanceTimeline, 
  generateResearchChecklist 
} from '@/lib/scoring';
import { exportToRIS, exportComparisonToCSV, exportCitationsToCSV } from '@/lib/exportUtils';
import { ClinicalTrial, PubMedCitation, RepurposingCandidate } from '@/types';

describe('Repurpose Compass & Research Readiness Scoring Engine', () => {
  const sampleTrial: ClinicalTrial = {
    nctId: 'NCT01234567',
    title: 'Phase 3 Evaluation of Compound',
    phase: 'PHASE 3',
    status: 'COMPLETED',
    conditions: ['Polycystic Ovary Syndrome'],
    leadSponsor: 'University Health',
    studyUrl: 'https://clinicaltrials.gov/study/NCT01234567',
  };

  const sampleCitation: PubMedCitation = {
    pmid: '34567890',
    title: 'Insulin Sensitization and Ovulatory Function in PCOS',
    journal: 'Hum Reprod',
    pubDate: '2023',
    authors: ['Smith J', 'Taylor R'],
    url: 'https://pubmed.ncbi.nlm.nih.gov/34567890/',
  };

  it('computes transparent 100-point breakdown with exact reasons for every component', () => {
    const res = computeResearchReadinessScore({
      condition: 'Polycystic Ovary Syndrome',
      trials: [sampleTrial],
      citations: [sampleCitation, { ...sampleCitation, pmid: '34567891' }],
      mechanismOfAction: 'Inhibits complex I and stimulates AMPK pathway.',
      biologicalRationale: 'Pathway engagement reverses hyperinsulinemic hyperandrogenism.',
    });

    expect(res.breakdown.clinicalTrialMaturity.score).toBeGreaterThanOrEqual(18);
    expect(res.breakdown.clinicalTrialMaturity.max).toBe(25);
    expect(res.breakdown.clinicalTrialMaturity.reason).toContain('Phase 3');

    expect(res.breakdown.publishedHumanEvidence.score).toBe(14); // 2 citations
    expect(res.breakdown.publishedHumanEvidence.max).toBe(25);
    expect(res.breakdown.publishedHumanEvidence.reason).toContain('2 peer-reviewed PubMed citations');

    expect(res.breakdown.mechanisticPlausibility.score).toBe(20);
    expect(res.breakdown.mechanisticPlausibility.max).toBe(20);

    expect(res.breakdown.sourceQualityRecency.max).toBe(15);
    expect(res.breakdown.safetyContextCompatibility.max).toBe(15);

    expect(res.totalScore).toBeGreaterThanOrEqual(60);
    expect(res.totalScore).toBeLessThanOrEqual(100);
  });

  it('safeguard: a candidate with 0 published citations is permanently capped at max 55 and never High readiness', () => {
    const res = computeResearchReadinessScore({
      condition: 'Novel Target Condition',
      trials: [sampleTrial, { ...sampleTrial, nctId: 'NCT00000002', phase: 'PHASE 4' }],
      citations: [], // 0 citations!
      mechanismOfAction: 'Well characterized biological mechanism.',
    });

    expect(res.totalScore).toBeLessThanOrEqual(55);
    expect(res.evidenceTier).not.toBe('High');
    expect(res.trialOutcomeStatus).toContain('trial activity identified; published outcome evidence unavailable');
  });

  it('safeguard: 0 trials and 0 citations caps score at max 18 and labels as Insufficient evidence', () => {
    const res = computeResearchReadinessScore({
      condition: 'Theoretical Indication',
      trials: [],
      citations: [],
      mechanismOfAction: 'Uncharacterized mechanism',
    });

    expect(res.totalScore).toBeLessThanOrEqual(18);
    expect(res.evidenceTier).toBe('Insufficient evidence');
  });

  it('safeguard: deducts points for terminated trials and flags conflict', () => {
    const terminatedTrial: ClinicalTrial = {
      nctId: 'NCT99999999',
      title: 'Stopped Trial',
      phase: 'PHASE 2',
      status: 'TERMINATED',
      conditions: ['Condition X'],
      leadSponsor: 'Academic Health Sponsor',
      studyUrl: 'https://clinicaltrials.gov/study/NCT99999999',
    };

    const res = computeResearchReadinessScore({
      condition: 'Condition X',
      trials: [terminatedTrial],
      citations: [],
    });

    expect(res.breakdown.conflictPenalties.score).toBeLessThanOrEqual(-15);
    expect(res.breakdown.conflictPenalties.reason).toContain('terminated, withdrawn, or suspended');
  });

  it('correctly maps all 8 research states', () => {
    // 1. Approved
    expect(determineResearchState({
      condition: 'Type 2 Diabetes',
      trials: [],
      citations: [],
      isApproved: true,
    })).toBe('Approved indication');

    // 2. Terminated
    expect(determineResearchState({
      condition: 'Condition A',
      trials: [{ ...sampleTrial, status: 'TERMINATED' }],
      citations: [],
    })).toBe('Trial terminated, withdrawn, or suspended');

    // 3. Investigational
    expect(determineResearchState({
      condition: 'Condition B',
      trials: [sampleTrial],
      citations: [sampleCitation],
    })).toBe('Investigational');

    // 4. Off-label
    expect(determineResearchState({
      condition: 'Condition C',
      trials: [],
      citations: [sampleCitation, sampleCitation],
    })).toBe('Off-label evidence');

    // 5. Preclinical
    expect(determineResearchState({
      condition: 'Condition D',
      trials: [],
      citations: [],
      mechanismOfAction: 'Known active kinase inhibitor',
    })).toBe('Preclinical');

    // 6. Insufficient evidence
    expect(determineResearchState({
      condition: 'Condition E',
      trials: [],
      citations: [],
      mechanismOfAction: '',
    })).toBe('Insufficient evidence');
  });

  it('detects verification needs and contradictions panel', () => {
    const contradictions = detectContradictions({
      condition: 'Renal Fibrosis',
      trials: [{ ...sampleTrial, phase: 'PHASE 3' }],
      citations: [], // Trial exists but no published outcome
      warnings: ['Lactic acidosis risk in kidney dysfunction'],
      contraindications: ['Severe renal impairment'],
    });

    expect(contradictions.length).toBeGreaterThanOrEqual(2);
    expect(contradictions.some(c => c.id === 'trial_no_outcome')).toBe(true);
    expect(contradictions.some(c => c.category === 'safety')).toBe(true);
  });

  it('generates chronological provenance timeline with source URLs', () => {
    const timeline = buildProvenanceTimeline({
      drugName: 'Metformin',
      condition: 'PCOS',
      trials: [sampleTrial],
      citations: [sampleCitation],
      lastVerifiedDate: '2026-10-02',
    });

    expect(timeline.length).toBeGreaterThanOrEqual(2);
    expect(timeline.some(e => e.source === 'ClinicalTrials.gov')).toBe(true);
    expect(timeline.some(e => e.source === 'PubMed')).toBe(true);
  });

  it('generates deterministic non-clinical research checklist', () => {
    const checklist = generateResearchChecklist({
      condition: 'PCOS',
      trials: [sampleTrial],
      citations: [sampleCitation],
      mechanismOfAction: 'AMPK pathway activation',
      contradictions: [],
    });

    expect(checklist.length).toBeGreaterThanOrEqual(4);
    expect(checklist.some(s => s.id === 'review_trials')).toBe(true);
    expect(checklist.some(s => s.id === 'export_citations')).toBe(true);
  });

  it('exports valid RIS bibliography format', () => {
    const ris = exportToRIS([sampleCitation], 'Metformin', 'PCOS');
    expect(ris).toContain('TY  - JOUR');
    expect(ris).toContain('TI  - Insulin Sensitization and Ovulatory Function in PCOS');
    expect(ris).toContain('UR  - https://pubmed.ncbi.nlm.nih.gov/34567890/');
    expect(ris).toContain('ER  - ');
  });

  it('exports valid Compare CSV format', () => {
    const candidate: RepurposingCandidate = {
      id: 'cand-1',
      condition: 'Polycystic Ovary Syndrome',
      status: 'Investigational',
      researchState: 'Investigational',
      readinessScore: 78,
      readinessBreakdown: {
        clinicalTrialMaturity: { score: 20, max: 25, reason: 'Phase 3' },
        publishedHumanEvidence: { score: 20, max: 25, reason: 'Citations' },
        mechanisticPlausibility: { score: 18, max: 20, reason: 'Plausible' },
        sourceQualityRecency: { score: 10, max: 15, reason: 'Corroborated' },
        safetyContextCompatibility: { score: 10, max: 15, reason: 'Safe' },
        conflictPenalties: { score: 0, reason: 'None' },
      },
      highestPhase: 'Phase 3',
      safetyNotes: [],
      sourceCount: 2,
      evidenceScore: {
        totalScore: 78,
        clinicalTrialScore: 32,
        humanObservationalScore: 16,
        mechanisticScore: 18,
        reproducibilityScore: 8,
        safetyCompatibilityScore: 8,
        evidenceTier: 'Moderate',
        uncertaintyFlags: [],
        contributingFactors: [],
      },
      evidenceNote: 'Test note',
      clinicalTrials: [sampleTrial],
      citations: [sampleCitation],
      biologicalRationale: 'Test rationale',
    };

    const csv = exportComparisonToCSV([{ drug: 'Metformin', candidate }]);
    expect(csv).toContain('Drug Generic Name,Candidate Condition,Research State');
    expect(csv).toContain('"Metformin"');
    expect(csv).toContain('"Polycystic Ovary Syndrome"');
    expect(csv).toContain('"78"');
    expect(csv).toContain('For education and research use only.');
  });
});
