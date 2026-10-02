/**
 * Medical Condition Normalization & Deduplication Engine
 * Normalizes biomedical disease strings, merges equivalent clinical variants,
 * applies standardized clinical casing, and deduplicates trials and citations.
 */

import { ClinicalTrial, PubMedCitation } from '@/types';

// Standard dictionary of common medical condition variants mapped to canonical representations
const CONDITION_ALIASES: Record<string, { canonicalKey: string; displayName: string }> = {
  // COVID-19 / SARS-CoV-2
  'covid-19': { canonicalKey: 'covid-19', displayName: 'COVID-19' },
  'covid19': { canonicalKey: 'covid-19', displayName: 'COVID-19' },
  'covid 19': { canonicalKey: 'covid-19', displayName: 'COVID-19' },
  'sars-cov-2': { canonicalKey: 'covid-19', displayName: 'COVID-19' },
  'sars-cov-2 infection': { canonicalKey: 'covid-19', displayName: 'COVID-19' },
  'coronavirus disease 2019': { canonicalKey: 'covid-19', displayName: 'COVID-19' },
  'coronavirus disease 19': { canonicalKey: 'covid-19', displayName: 'COVID-19' },
  'coronavirus infection': { canonicalKey: 'covid-19', displayName: 'COVID-19' },
  'covid-19 pneumonia': { canonicalKey: 'covid-19', displayName: 'COVID-19' },
  'severe covid-19': { canonicalKey: 'covid-19', displayName: 'COVID-19' },
  '2019 novel coronavirus': { canonicalKey: 'covid-19', displayName: 'COVID-19' },

  // HIV
  'hiv': { canonicalKey: 'hiv-infection', displayName: 'HIV infection' },
  'hiv infection': { canonicalKey: 'hiv-infection', displayName: 'HIV infection' },
  'hiv infections': { canonicalKey: 'hiv-infection', displayName: 'HIV infection' },
  'hiv-1 infection': { canonicalKey: 'hiv-infection', displayName: 'HIV infection' },
  'human immunodeficiency virus': { canonicalKey: 'hiv-infection', displayName: 'HIV infection' },
  'human immunodeficiency virus infection': { canonicalKey: 'hiv-infection', displayName: 'HIV infection' },

  // COPD
  'copd': { canonicalKey: 'copd', displayName: 'Chronic obstructive pulmonary disease with exacerbation' },
  'copd exacerbation': { canonicalKey: 'copd', displayName: 'Chronic obstructive pulmonary disease with exacerbation' },
  'chronic obstructive pulmonary disease': { canonicalKey: 'copd', displayName: 'Chronic obstructive pulmonary disease with exacerbation' },
  'chronic obstructive pulmonary disease with exacerbation': { canonicalKey: 'copd', displayName: 'Chronic obstructive pulmonary disease with exacerbation' },
  'acute exacerbation of copd': { canonicalKey: 'copd', displayName: 'Chronic obstructive pulmonary disease with exacerbation' },
  'chronic obstructive lung disease': { canonicalKey: 'copd', displayName: 'Chronic obstructive pulmonary disease with exacerbation' },

  // Cystic Fibrosis
  'cystic fibrosis': { canonicalKey: 'cystic-fibrosis', displayName: 'Cystic fibrosis' },
  'mucoviscidosis': { canonicalKey: 'cystic-fibrosis', displayName: 'Cystic fibrosis' },
  'cystic fibrosis lung disease': { canonicalKey: 'cystic-fibrosis', displayName: 'Cystic fibrosis' },

  // Malaria
  'malaria': { canonicalKey: 'malaria', displayName: 'Malaria' },
  'plasmodium falciparum malaria': { canonicalKey: 'malaria', displayName: 'Malaria' },
  'falciparum malaria': { canonicalKey: 'malaria', displayName: 'Malaria' },
  'uncomplicated malaria': { canonicalKey: 'malaria', displayName: 'Malaria' },

  // Community-Acquired Pneumonia
  'community-acquired pneumonia': { canonicalKey: 'community-acquired-pneumonia', displayName: 'Community-acquired pneumonia' },
  'community acquired pneumonia': { canonicalKey: 'community-acquired-pneumonia', displayName: 'Community-acquired pneumonia' },
  'cap': { canonicalKey: 'community-acquired-pneumonia', displayName: 'Community-acquired pneumonia' },

  // Asthma
  'asthma': { canonicalKey: 'asthma', displayName: 'Asthma' },
  'bronchial asthma': { canonicalKey: 'asthma', displayName: 'Asthma' },
  'severe asthma': { canonicalKey: 'asthma', displayName: 'Asthma' },

  // Bronchiectasis
  'bronchiectasis': { canonicalKey: 'bronchiectasis', displayName: 'Bronchiectasis' },
  'non-cf bronchiectasis': { canonicalKey: 'bronchiectasis', displayName: 'Bronchiectasis' },
  'non cystic fibrosis bronchiectasis': { canonicalKey: 'bronchiectasis', displayName: 'Bronchiectasis' },

  // PCOS
  'pcos': { canonicalKey: 'pcos', displayName: 'Polycystic ovary syndrome (PCOS)' },
  'polycystic ovary syndrome': { canonicalKey: 'pcos', displayName: 'Polycystic ovary syndrome (PCOS)' },
  'polycystic ovarian syndrome': { canonicalKey: 'pcos', displayName: 'Polycystic ovary syndrome (PCOS)' },

  // Cancers & Oncology
  'prostate cancer': { canonicalKey: 'prostate-cancer', displayName: 'Prostate cancer' },
  'prostate carcinoma': { canonicalKey: 'prostate-cancer', displayName: 'Prostate cancer' },
  'prostate neoplasm': { canonicalKey: 'prostate-cancer', displayName: 'Prostate cancer' },
  'metastatic prostate cancer': { canonicalKey: 'prostate-cancer', displayName: 'Prostate cancer' },
  'multiple myeloma': { canonicalKey: 'multiple-myeloma', displayName: 'Multiple myeloma' },
  'myeloma': { canonicalKey: 'multiple-myeloma', displayName: 'Multiple myeloma' },
  'plasma cell myeloma': { canonicalKey: 'multiple-myeloma', displayName: 'Multiple myeloma' },
  'colorectal cancer': { canonicalKey: 'colorectal-cancer', displayName: 'Colorectal neoplasms' },
  'colorectal neoplasms': { canonicalKey: 'colorectal-cancer', displayName: 'Colorectal neoplasms' },
  'colorectal adenoma': { canonicalKey: 'colorectal-cancer', displayName: 'Colorectal neoplasms' },

  // Fibrosis & Autoimmune
  'systemic sclerosis': { canonicalKey: 'systemic-sclerosis', displayName: 'Systemic sclerosis' },
  'scleroderma': { canonicalKey: 'systemic-sclerosis', displayName: 'Systemic sclerosis' },
  'diffuse systemic sclerosis': { canonicalKey: 'systemic-sclerosis', displayName: 'Systemic sclerosis' },
};

// Known medical acronyms that should always be displayed in uppercase
const PRESERVE_ACRONYMS = new Set([
  'COVID-19',
  'HIV',
  'COPD',
  'PCOS',
  'RSV',
  'ARDS',
  'NASH',
  'NAFLD',
  'ALS',
  'GIST',
  'CML',
  'CMV',
  'EBV',
  'HPV',
  'HCV',
  'HBV',
  'IBD',
  'SLE',
  'RA',
]);

const LOWERCASE_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
  'due',
]);

/**
 * Standardize disease condition casing following medical taxonomy:
 * Capitalizes first letter of sentence, keeps recognized acronyms uppercase,
 * and leaves prepositions/articles lowercase unless at the start.
 */
export function formatMedicalConditionDisplay(name: string): string {
  const cleaned = name.trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';

  const words = cleaned.split(' ');
  const formattedWords = words.map((word, index) => {
    const cleanWord = word.replace(/[^\w-]/g, '');
    const upper = cleanWord.toUpperCase();

    // Check if word is a recognized medical acronym
    if (PRESERVE_ACRONYMS.has(upper)) {
      return word.replace(new RegExp(cleanWord, 'i'), upper);
    }

    const lower = cleanWord.toLowerCase();

    // If first word, always capitalize
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }

    // If preposition/conjunction, lowercase
    if (LOWERCASE_WORDS.has(lower)) {
      return word.toLowerCase();
    }

    // Default: lowercase for subsequent words in standard sentence-case medical taxonomy
    // (e.g. "Chronic obstructive pulmonary disease with exacerbation", "HIV infection")
    return word.toLowerCase();
  });

  return formattedWords.join(' ');
}

/**
 * Normalizes a raw condition string from clinical trial records.
 * Returns a canonical key for aggregation and a medically formatted display title.
 */
export function normalizeCondition(rawName: string): { canonicalKey: string; displayName: string } {
  const simplified = rawName
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ');

  if (!simplified) {
    return { canonicalKey: 'unknown', displayName: 'Unspecified condition' };
  }

  // 1. Direct dictionary match
  if (CONDITION_ALIASES[simplified]) {
    return CONDITION_ALIASES[simplified];
  }

  // 2. Substring dictionary match for composite terms (e.g., "Infection, Covid-19" or "Covid 19 Positive")
  for (const [alias, canonical] of Object.entries(CONDITION_ALIASES)) {
    if (simplified.includes(alias)) {
      return canonical;
    }
  }

  // 3. Fallback: normalize key and apply medical sentence casing
  const canonicalKey = simplified.replace(/\s+/g, '-');
  const displayName = formatMedicalConditionDisplay(rawName);

  return { canonicalKey, displayName };
}

/**
 * Deduplicate clinical trials by NCT identifier across merged condition records.
 */
export function deduplicateTrials(trials: ClinicalTrial[]): ClinicalTrial[] {
  const seenNcts = new Set<string>();
  const uniqueTrials: ClinicalTrial[] = [];

  for (const trial of trials) {
    const nct = (trial.nctId || '').trim().toUpperCase();
    if (!nct) {
      uniqueTrials.push(trial);
      continue;
    }

    if (!seenNcts.has(nct)) {
      seenNcts.add(nct);
      uniqueTrials.push(trial);
    }
  }

  return uniqueTrials;
}

/**
 * Deduplicate PubMed literature citations by PMID and title.
 */
export function deduplicateCitations(citations: PubMedCitation[]): PubMedCitation[] {
  const seenPmids = new Set<string>();
  const seenTitles = new Set<string>();
  const uniqueCitations: PubMedCitation[] = [];

  for (const cite of citations) {
    const pmid = (cite.pmid || '').trim();
    const titleKey = (cite.title || '').trim().toLowerCase().slice(0, 60);

    if (pmid && seenPmids.has(pmid)) continue;
    if (titleKey && seenTitles.has(titleKey)) continue;

    if (pmid) seenPmids.add(pmid);
    if (titleKey) seenTitles.add(titleKey);

    uniqueCitations.push(cite);
  }

  return uniqueCitations;
}

/**
 * Filters out generic drug names from brand name arrays.
 * Preserves only distinct, verified proprietary brand identifiers.
 */
export function filterDistinctBrandNames(brandNames: string[], genericName: string): string[] {
  const genericLower = (genericName || '').trim().toLowerCase();
  if (!genericLower) return brandNames;

  const seen = new Set<string>();
  const distinct: string[] = [];

  for (const brand of brandNames) {
    const trimmed = brand.trim();
    if (!trimmed || trimmed.length < 2) continue;

    const bLower = trimmed.toLowerCase();

    // Exclude if identical to generic name (case-insensitive)
    if (bLower === genericLower) continue;

    // Exclude generic salt / form variations (e.g. "Azithromycin Dihydrate", "Azithromycin Oral Suspension")
    if (bLower.startsWith(genericLower) && (
      bLower.includes('dihydrate') ||
      bLower.includes('monohydrate') ||
      bLower.includes('hydrochloride') ||
      bLower.includes('sodium') ||
      bLower.includes('potassium') ||
      bLower.includes('mesylate') ||
      bLower.includes('maleate') ||
      bLower.includes('oral') ||
      bLower.includes('tablet') ||
      bLower.includes('capsule') ||
      bLower.includes('injection')
    )) {
      continue;
    }

    // Exclude if already added
    if (!seen.has(bLower)) {
      seen.add(bLower);
      distinct.push(trimmed);
    }
  }

  return distinct;
}
