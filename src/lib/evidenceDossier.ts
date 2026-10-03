import { PUBLISHED_DRUG_REGISTRY } from './publishedDrugs';
import { aggregateDrugResearch } from './evidenceEngine';
import { 
  RepurposingCandidate, 
  DrugConcept, 
  ResearchState,
  DrugResearchSnapshot
} from '@/types';
import { 
  determineResearchState, 
  computeResearchReadinessScore, 
  detectContradictions, 
  buildProvenanceTimeline, 
  generateResearchChecklist 
} from './scoring';

export interface EvidenceDossierData {
  drug: DrugConcept;
  approvedIndications: string[];
  candidate: RepurposingCandidate;
  drugSlug: string;
  conditionSlug: string;
  isIndexable: boolean;
  lastVerifiedDate: string;
  sourceList: Array<{ name: string; url?: string; identifier?: string; status: string }>;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function matchesConditionSlug(conditionName: string, targetSlug: string): boolean {
  const normCondition = slugify(conditionName);
  const cleanTarget = targetSlug.toLowerCase().trim();

  if (normCondition === cleanTarget) return true;
  if (normCondition.includes(cleanTarget) || cleanTarget.includes(normCondition)) return true;

  // Keyword segment matching (e.g. "pcos" vs "polycystic-ovary-syndrome-pcos")
  const targetTokens = cleanTarget.split('-').filter(t => t.length > 2);
  const conditionTokens = normCondition.split('-').filter(t => t.length > 2);
  const shared = targetTokens.filter(t => conditionTokens.includes(t));
  return shared.length >= 2 || (shared.length === 1 && targetTokens.length === 1);
}

/**
 * Retrieves the complete evidence dossier for a drug-condition pair.
 */
export async function getEvidenceDossier(
  drugSlug: string,
  conditionSlug: string
): Promise<EvidenceDossierData | null> {
  const normDrugSlug = slugify(drugSlug);
  const normCondSlug = slugify(conditionSlug);

  // 1. Check PUBLISHED_DRUG_REGISTRY first
  const publishedGuide = PUBLISHED_DRUG_REGISTRY[normDrugSlug];
  if (publishedGuide) {
    const candidateMatch = publishedGuide.candidates.find(c => 
      matchesConditionSlug(c.condition, normCondSlug)
    );

    if (candidateMatch) {
      // Ensure all Repurpose Compass fields are thoroughly computed
      const trials = candidateMatch.clinicalTrials || [];
      const citations = candidateMatch.citations || [];
      const mechanism = publishedGuide.drug.mechanismOfAction || '';
      const warnings = publishedGuide.drug.warnings || [];
      const contraindications = publishedGuide.drug.contraindications || [];

      const researchState = candidateMatch.researchState || determineResearchState({
        condition: candidateMatch.condition,
        trials,
        citations,
        mechanismOfAction: mechanism,
        isApproved: false,
      });

      const readinessResult = computeResearchReadinessScore({
        condition: candidateMatch.condition,
        trials,
        citations,
        mechanismOfAction: mechanism,
        biologicalRationale: candidateMatch.biologicalRationale,
        fdaWarnings: warnings,
        fdaContraindications: contraindications,
      });

      const contradictions = candidateMatch.contradictions || detectContradictions({
        condition: candidateMatch.condition,
        trials,
        citations,
        mechanismOfAction: mechanism,
        warnings,
        contraindications,
      });

      const timeline = candidateMatch.timeline || buildProvenanceTimeline({
        drugName: publishedGuide.drug.genericName,
        condition: candidateMatch.condition,
        trials,
        citations,
        lastVerifiedDate: publishedGuide.lastReviewedDate,
      });

      const checklist = candidateMatch.checklist || generateResearchChecklist({
        condition: candidateMatch.condition,
        trials,
        citations,
        mechanismOfAction: mechanism,
        warnings,
        contraindications,
        contradictions,
      });

      const enrichedCandidate: RepurposingCandidate = {
        ...candidateMatch,
        researchState,
        readinessScore: candidateMatch.readinessScore ?? readinessResult.totalScore,
        readinessBreakdown: candidateMatch.readinessBreakdown ?? readinessResult.breakdown,
        readinessTier: candidateMatch.readinessTier ?? readinessResult.evidenceTier,
        contradictions,
        timeline,
        checklist,
      };

      const isIndexable = Boolean(
        publishedGuide.isIndexable &&
        (trials.length > 0 || citations.length > 0) &&
        researchState !== 'No verified evidence found' &&
        readinessResult.totalScore >= 35
      );

      const sourceList = (publishedGuide.drug.sources || []).map(s => ({
        name: s.name,
        url: s.url,
        identifier: s.responseId,
        status: s.status,
      }));

      return {
        drug: publishedGuide.drug,
        approvedIndications: publishedGuide.approvedIndications || [],
        candidate: enrichedCandidate,
        drugSlug: normDrugSlug,
        conditionSlug: normCondSlug,
        isIndexable,
        lastVerifiedDate: publishedGuide.lastReviewedDate,
        sourceList,
      };
    }
  }

  // 2. Fallback to live aggregated research from primary APIs
  try {
    const research: DrugResearchSnapshot | null = await aggregateDrugResearch(normDrugSlug);
    if (!research || !research.drug || !research.candidates) {
      return null;
    }

    const candidateMatch = research.candidates.find(c => 
      matchesConditionSlug(c.condition, normCondSlug)
    );

    if (!candidateMatch) {
      return null;
    }

    const hasTrials = (candidateMatch.clinicalTrials || []).length > 0;
    const hasCitations = (candidateMatch.citations || []).length > 0;
    const score = candidateMatch.readinessScore ?? candidateMatch.evidenceScore.totalScore;
    
    // Only index when verified human trials or citations exist and score is sufficient
    const isIndexable = Boolean(hasTrials || hasCitations) && score >= 40;

    const sourceList = (research.drug.sources || []).map(s => ({
      name: s.name,
      url: s.url,
      identifier: s.responseId,
      status: s.status,
    }));

    return {
      drug: research.drug,
      approvedIndications: research.approvedIndications || [],
      candidate: candidateMatch,
      drugSlug: normDrugSlug,
      conditionSlug: normCondSlug,
      isIndexable,
      lastVerifiedDate: research.fetchedAt.split('T')[0],
      sourceList,
    };
  } catch (err) {
    console.error('Failed to aggregate evidence dossier:', err);
    return null;
  }
}
