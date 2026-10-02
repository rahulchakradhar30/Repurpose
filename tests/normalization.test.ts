import { describe, it, expect } from 'vitest';
import { 
  normalizeCondition, 
  formatMedicalConditionDisplay, 
  filterDistinctBrandNames, 
  deduplicateTrials, 
  deduplicateCitations 
} from '@/lib/normalization';
import { computeEvidenceScore } from '@/lib/scoring';
import { getPublishedDrugBySlug } from '@/lib/publishedDrugs';
import { ClinicalTrial, PubMedCitation } from '@/types';

describe('Condition Normalization & Medical Casing', () => {
  it('merges COVID-19 variations into standard canonical COVID-19', () => {
    const variations = [
      'Covid-19',
      'covid19',
      'COVID 19',
      'sars-cov-2',
      'coronavirus disease 2019',
      'Severe Covid-19',
      'Covid-19 pneumonia'
    ];

    for (const v of variations) {
      const result = normalizeCondition(v);
      expect(result.canonicalKey).toBe('covid-19');
      expect(result.displayName).toBe('COVID-19');
    }
  });

  it('normalizes and applies clinical casing for HIV and COPD variants', () => {
    const hivResult = normalizeCondition('hiv infections');
    expect(hivResult.displayName).toBe('HIV infection');
    expect(hivResult.canonicalKey).toBe('hiv-infection');

    const copdResult = normalizeCondition('acute exacerbation of copd');
    expect(copdResult.displayName).toBe('Chronic obstructive pulmonary disease with exacerbation');
    expect(copdResult.canonicalKey).toBe('copd');
  });

  it('formats medical sentences preserving medical acronyms in uppercase and prepositions in lowercase', () => {
    expect(formatMedicalConditionDisplay('chronic obstructive pulmonary disease with exacerbation'))
      .toBe('Chronic obstructive pulmonary disease with exacerbation');

    expect(formatMedicalConditionDisplay('cystic fibrosis'))
      .toBe('Cystic fibrosis');

    expect(formatMedicalConditionDisplay('community acquired pneumonia'))
      .toBe('Community acquired pneumonia');
  });

  it('deduplicates trials across identical NCT identifiers', () => {
    const trials: ClinicalTrial[] = [
      {
        nctId: 'NCT04381936',
        title: 'Trial A',
        phase: 'Phase 3',
        status: 'COMPLETED',
        conditions: ['COVID-19'],
        leadSponsor: 'Oxford',
        studyUrl: 'https://clinicaltrials.gov/study/NCT04381936',
      },
      {
        nctId: 'nct04381936', // lower case duplicate
        title: 'Trial A duplicate',
        phase: 'Phase 3',
        status: 'COMPLETED',
        conditions: ['Covid 19'],
        leadSponsor: 'Oxford',
        studyUrl: 'https://clinicaltrials.gov/study/NCT04381936',
      },
      {
        nctId: 'NCT04403893',
        title: 'Trial B',
        phase: 'Phase 3',
        status: 'COMPLETED',
        conditions: ['COVID-19'],
        leadSponsor: 'Oxford',
        studyUrl: 'https://clinicaltrials.gov/study/NCT04403893',
      },
    ];

    const deduplicated = deduplicateTrials(trials);
    expect(deduplicated).toHaveLength(2);
    expect(deduplicated.map(t => t.nctId)).toEqual(['NCT04381936', 'NCT04403893']);
  });

  it('deduplicates citations across identical PMIDs and titles', () => {
    const citations: PubMedCitation[] = [
      {
        pmid: '33545096',
        title: 'Azithromycin in patients admitted to hospital with COVID-19',
        journal: 'Lancet',
        pubDate: '2021',
        authors: ['RECOVERY'],
        url: 'https://pubmed.ncbi.nlm.nih.gov/33545096/',
      },
      {
        pmid: '33545096', // exact duplicate PMID
        title: 'Azithromycin in patients admitted to hospital with COVID-19',
        journal: 'Lancet',
        pubDate: '2021',
        authors: ['RECOVERY Group'],
        url: 'https://pubmed.ncbi.nlm.nih.gov/33545096/',
      },
      {
        pmid: '33676597',
        title: 'Azithromycin for community treatment of suspected COVID-19',
        journal: 'Lancet',
        pubDate: '2021',
        authors: ['PRINCIPLE'],
        url: 'https://pubmed.ncbi.nlm.nih.gov/33676597/',
      },
    ];

    const deduplicated = deduplicateCitations(citations);
    expect(deduplicated).toHaveLength(2);
    expect(deduplicated.map(c => c.pmid)).toEqual(['33545096', '33676597']);
  });
});

describe('Drug Data Accuracy & Brand Name Handling', () => {
  it('filters out generic drug name and salt derivatives from brand names', () => {
    const rawBrandNames = [
      'Azithromycin',
      'Azithromycin Dihydrate',
      'Azithromycin Monohydrate',
      'Azithromycin Oral Suspension',
      'Zithromax',
      'Zmax',
      'Zithromax', // duplicate
    ];

    const distinct = filterDistinctBrandNames(rawBrandNames, 'Azithromycin');
    expect(distinct).toEqual(['Zithromax', 'Zmax']);
    expect(distinct).not.toContain('Azithromycin');
    expect(distinct).not.toContain('Azithromycin Dihydrate');
  });

  it('handles case-insensitive generic match filtering', () => {
    const rawBrandNames = ['METFORMIN', 'Metformin Hydrochloride', 'Glucophage', 'Fortamet'];
    const distinct = filterDistinctBrandNames(rawBrandNames, 'metformin');
    expect(distinct).toEqual(['Glucophage', 'Fortamet']);
  });
});

describe('Evidence Score Safeguards & Trial Outcome Disclaimers', () => {
  it('caps score and disallows High evidence tier when 0 citations are present without completed phase 3/4 trial', () => {
    const activePhase2Trials: ClinicalTrial[] = [
      {
        nctId: 'NCT02000000',
        title: 'Active Phase 2 Study',
        phase: 'PHASE 2',
        status: 'RECRUITING',
        conditions: ['Exploratory Condition'],
        leadSponsor: 'Research Institute',
        studyUrl: 'https://clinicaltrials.gov/study/NCT02000000',
      }
    ];

    const breakdown = computeEvidenceScore({
      condition: 'Exploratory Condition',
      trials: activePhase2Trials,
      citations: [], // 0 citations
      mechanismOfAction: 'Documented cell signaling receptor interaction.',
      biologicalRationale: 'Exploration based on preclinical models.',
    });

    // Score must be capped below 70 and not be High
    expect(breakdown.totalScore).toBeLessThanOrEqual(58);
    expect(breakdown.evidenceTier).not.toBe('High');
    expect(breakdown.humanObservationalScore).toBe(0);
    expect(breakdown.uncertaintyFlags).toContain('Human evidence unavailable: No peer-reviewed PubMed citations indexed for this specific pairing.');
  });

  it('attaches explicit trial outcome disclaimer when Phase 2/3 trial activity exists but 0 PubMed citations are found', () => {
    const trials: ClinicalTrial[] = [
      {
        nctId: 'NCT03000000',
        title: 'Phase 3 Evaluation in New Indication',
        phase: 'PHASE 3',
        status: 'ACTIVE_NOT_RECRUITING',
        conditions: ['Candidate Disease'],
        leadSponsor: 'Clinical Group',
        studyUrl: 'https://clinicaltrials.gov/study/NCT03000000',
      }
    ];

    const breakdown = computeEvidenceScore({
      condition: 'Candidate Disease',
      trials,
      citations: [],
      mechanismOfAction: 'Known enzymatic inhibitor.',
    });

    expect(breakdown.trialOutcomeStatus).toBe('Clinical trial activity identified; published outcome evidence unavailable.');
    expect(breakdown.uncertaintyFlags[0]).toBe('Clinical trial activity identified; published outcome evidence unavailable.');
  });

  it('caps score at max 20 and sets Insufficient evidence when no trials and no citations exist', () => {
    const breakdown = computeEvidenceScore({
      condition: 'Unsubstantiated Hypothesis',
      trials: [],
      citations: [],
      mechanismOfAction: '',
    });

    expect(breakdown.totalScore).toBeLessThanOrEqual(20);
    expect(breakdown.evidenceTier).toBe('Insufficient evidence');
    expect(breakdown.uncertaintyFlags).toContain(
      'Insufficient evidence: No registered interventional trials or peer-reviewed human publications found.'
    );
  });
});

describe('Azithromycin Verified Pipeline & Published Guide', () => {
  it('retrieves publishable Azithromycin guide with verified sources and distinct brand names', () => {
    const guide = getPublishedDrugBySlug('azithromycin');
    expect(guide).not.toBeNull();
    if (!guide) return;

    expect(guide.drug.genericName).toBe('Azithromycin');
    expect(guide.drug.drugClass).toBe('Macrolide antibiotic');
    expect(guide.drug.brandNames).toEqual(['Zithromax', 'Zmax']);
    expect(guide.drug.brandNames).not.toContain('Azithromycin');
    expect(guide.drug.rxNormId).toBe('18631');
    expect(guide.drug.pubchemCid).toBe('447043');
    expect(guide.isIndexable).toBe(true);
    expect(guide.drug.sources.length).toBeGreaterThanOrEqual(4);

    // Verify candidates
    const covidCandidate = guide.candidates.find(c => c.condition === 'COVID-19');
    expect(covidCandidate).toBeDefined();
    expect(covidCandidate?.status).toBe('Unsupported');
    expect(covidCandidate?.evidenceScore.totalScore).toBeLessThan(70); // Never erroneously marked High

    const cfCandidate = guide.candidates.find(c => c.condition === 'Cystic fibrosis');
    expect(cfCandidate).toBeDefined();
    expect(cfCandidate?.highestPhase).toBe('Phase 3');
  });
});
