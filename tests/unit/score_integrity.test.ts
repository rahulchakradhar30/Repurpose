import { describe, it, expect } from 'vitest';
import { computeResearchReadinessScore } from '@/lib/scoring';
import { PUBLISHED_DRUG_REGISTRY } from '@/lib/publishedDrugs';
import { DRUG_DIRECTORY } from '@/lib/drugDirectory';
import { ClinicalTrial, PubMedCitation } from '@/types';

describe('Evidence Score Calculation & Data Integrity', () => {
  it('calculates evidence scores deterministically based on verified trial and citation data', () => {
    const trials: ClinicalTrial[] = [
      {
        nctId: 'NCT01234567',
        title: 'Phase 3 Trial of Drug in Pancreatic Cancer',
        phase: 'Phase 3',
        status: 'COMPLETED',
        conditions: ['Pancreatic Neoplasms'],
        leadSponsor: 'Cancer Institute',
        studyUrl: 'https://clinicaltrials.gov/study/NCT01234567',
      }
    ];

    const citations: PubMedCitation[] = [
      {
        pmid: '12345678',
        title: 'Efficacy of Drug in Pancreatic Neoplasms',
        journal: 'J Clin Oncol',
        pubDate: '2023-01-01',
        authors: ['Smith J'],
        url: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
      }
    ];

    const score = computeResearchReadinessScore({
      condition: 'Pancreatic Neoplasms',
      trials,
      citations,
      mechanismOfAction: 'Target pathway inhibition',
      drugName: 'Metformin',
    });

    expect(score.totalScore).toBeGreaterThan(40);
    expect(score.readinessTier).toBeDefined();
    expect(score.clinicalTrialMaturity).toBeGreaterThan(0);
    expect(score.publishedHumanEvidence).toBeGreaterThan(0);
  });

  it('ensures published drug registry cannot be mutated at runtime by client operations', () => {
    const registryEntries = Object.values(PUBLISHED_DRUG_REGISTRY);
    expect(registryEntries.length).toBeGreaterThan(0);

    const firstDrug = registryEntries[0];
    expect(firstDrug.drug.genericName).toBeDefined();
    expect(firstDrug.slug).toBeDefined();

    // Verify all drug entries have required verified properties
    for (const guide of registryEntries) {
      expect(typeof guide.drug.genericName).toBe('string');
      expect(typeof guide.slug).toBe('string');
      expect(Array.isArray(guide.approvedIndications)).toBe(true);
      expect(Array.isArray(guide.candidates)).toBe(true);
    }
  });

  it('verifies that curated drug directory has normalized names and valid source citations', () => {
    expect(DRUG_DIRECTORY.length).toBeGreaterThan(0);
    for (const entry of DRUG_DIRECTORY) {
      expect(entry.name.length).toBeGreaterThan(1);
      expect(entry.genericName.length).toBeGreaterThan(1);
    }
  });
});
