export type ResearchState = 
  | 'Approved indication'
  | 'Off-label evidence'
  | 'Investigational'
  | 'Preclinical'
  | 'Insufficient evidence'
  | 'Conflicting evidence'
  | 'Trial terminated, withdrawn, or suspended'
  | 'No verified evidence found';

// Backwards-compatible union for legacy and modern states
export type EvidenceStatus = 
  | 'Approved' 
  | 'Investigational' 
  | 'Off-label' 
  | 'Preclinical' 
  | 'Unsupported' 
  | ResearchState;

export interface SourceProvenance {
  name: 'RxNorm' | 'openFDA' | 'PubChem' | 'ClinicalTrials.gov' | 'PubMed' | 'UniProt';
  url: string;
  responseId?: string;
  timestamp: string;
  status: 'ok' | 'unavailable' | 'error';
  statusMessage?: string;
}

export interface DrugConcept {
  genericName: string;
  brandNames: string[];
  rxNormId?: string;
  pubchemCid?: string;
  drugClass?: string;
  mechanismOfAction?: string;
  description?: string;
  approvedIndications: string[];
  warnings: string[];
  contraindications: string[];
  targets?: string[];
  lastVerifiedDate: string;
  sources: SourceProvenance[];
}

export interface ClinicalTrial {
  nctId: string;
  title: string;
  phase: string;
  status: string; // RECRUITING, COMPLETED, ACTIVE_NOT_RECRUITING, TERMINATED, WITHDRAWN, SUSPENDED, etc.
  conditions: string[];
  leadSponsor: string;
  studyUrl: string;
  url?: string;
  enrollment?: number;
  startDate?: string;
  completionDate?: string;
  briefSummary?: string;
}

export interface PubMedCitation {
  pmid: string;
  title: string;
  journal: string;
  pubDate: string;
  authors: string[];
  doi?: string;
  url: string;
  abstractSnippet?: string;
}

export interface EvidenceScoreLegacy {
  clinicalTrialScore: number;
  humanObservationalScore: number;
  mechanisticScore: number;
  reproducibilityScore: number;
  safetyCompatibilityScore: number;
  totalScore: number;
  evidenceTier?: 'High' | 'Moderate' | 'Preliminary' | 'Insufficient evidence';
  contributingFactors: string[];
  uncertaintyFlags: string[];
}

/**
 * Transparent Research Readiness Score (0 - 100)
 * Replaces generic "Evidence Score" with empirical research readiness metric.
 * NOT an efficacy, approval, safety, or prescribing score.
 */
export interface ResearchReadinessBreakdown {
  totalScore: number;
  readinessTier: 'High readiness' | 'Moderate readiness' | 'Preliminary' | 'Insufficient evidence';
  evidenceTier: 'High' | 'Moderate' | 'Preliminary' | 'Insufficient evidence';
  clinicalTrialMaturity: number;           // 0 - 25
  clinicalTrialMaturityReason: string;
  publishedHumanEvidence: number;          // 0 - 25
  publishedHumanEvidenceReason: string;
  mechanisticPlausibility: number;         // 0 - 20
  mechanisticPlausibilityReason: string;
  sourceQualityReproducibility: number;   // 0 - 15
  sourceQualityReproducibilityReason: string;
  safetyCompatibility: number;             // 0 - 15
  safetyCompatibilityReason: string;
  evidenceConflictPenalty: number;         // <= 0 (subtracted)
  evidenceConflictPenaltyReason: string;
  trialOutcomeStatus?: string;
  contributingFactors: string[];
  uncertaintyFlags: string[];

  // Legacy field aliases for backwards compatibility with existing components and tests
  clinicalTrialScore: number;
  humanObservationalScore: number;
  mechanisticScore: number;
  reproducibilityScore: number;
  safetyCompatibilityScore: number;

  // Structured breakdown object for RepurposeCompass
  breakdown: {
    clinicalTrialMaturity: { score: number; max: number; reason: string };
    publishedHumanEvidence: { score: number; max: number; reason: string };
    mechanisticPlausibility: { score: number; max: number; reason: string };
    sourceQualityRecency: { score: number; max: number; reason: string };
    safetyContextCompatibility: { score: number; max: number; reason: string };
    conflictPenalties: { score: number; reason: string };
  };
}

// Backwards compatibility alias
export type EvidenceScoreBreakdown = ResearchReadinessBreakdown;

export interface ContradictionItem {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  category: 'trial' | 'literature' | 'safety' | 'mechanism' | 'normalization' | 'data_freshness' | string;
  recommendedAction?: string;
  sourceReference?: string;
}

export interface SourceTimelineEvent {
  id: string;
  date: string;
  title: string;
  summary?: string;
  description?: string;
  source: string;
  sourceName?: string;
  sourceId?: string;
  sourceUrl?: string;
  identifier?: string;
  timestamp?: string;
  type?: string;
}

export interface ResearchChecklistStep {
  id: string;
  title: string;
  label?: string;
  description: string;
  category: 'clinical_trial' | 'literature' | 'ontology' | 'safety' | 'mechanism' | 'comparative' | 'literature_review' | string;
  actionLink?: string;
  isCompleted?: boolean;
}

export interface RepurposingCandidate {
  id: string;
  condition: string;
  conditionCanonical?: string;
  status: EvidenceStatus;
  highestPhase: string;
  evidenceScore: ResearchReadinessBreakdown | EvidenceScoreLegacy;
  clinicalTrials: ClinicalTrial[];
  citations: PubMedCitation[];
  biologicalRationale: string;
  safetyNotes: string[];
  sourceCount: number;
  evidenceNote?: string;
  trialOutcomeStatus?: string;
  contradictions?: ContradictionItem[];
  timeline?: SourceTimelineEvent[];
  checklist?: ResearchChecklistStep[];
  // Repurpose Compass fields
  researchState?: ResearchState;
  readinessScore?: number;
  readinessBreakdown?: ResearchReadinessBreakdown['breakdown'];
  readinessTier?: string;
}

export interface AISummary {
  summary: string;
  limitations: string[];
  mechanismExplanation: string;
  evidenceGaps: string[];
  sourcesUsed: string[];
  isAIAssisted: boolean;
  generatedAt: string;
}

export interface DrugResearchSnapshot {
  drug: DrugConcept;
  approvedIndications: string[];
  candidates: RepurposingCandidate[];
  sourcesStatus: Record<string, { ok: boolean; message?: string; timestamp: string }>;
  fetchedAt: string;
}

export interface SavedResearchItem {
  id: string;
  userId: string;
  drugGenericName: string;
  rxNormId?: string;
  conditionFocus?: string;
  candidateConditionsCount: number;
  notes: string;
  tags: string[];
  savedAt: string;
  lastUpdated: string;
  evidenceSnapshot?: {
    totalScore: number;
    highestPhase: string;
    clinicalTrialsCount: number;
    citationsCount: number;
  };
}

export interface UserSearchHistory {
  id: string;
  query: string;
  genericName?: string;
  timestamp: string;
}

export type NewsCategory = 
  | 'All'
  | 'FDA Updates' 
  | 'Safety Alerts' 
  | 'Approvals' 
  | 'Clinical Research' 
  | 'Recalls';

export interface NewsArticleItem {
  slug: string;
  title: string;
  source: string; // e.g., 'FDA Drug Safety', 'FDA Newsroom', 'PubMed / NLM'
  sourceUrl: string;
  publishedAt: string; // YYYY-MM-DD or ISO string
  originalSourceDate?: string;
  lastVerifiedAt: string;
  category: 'FDA Updates' | 'Safety Alerts' | 'Approvals' | 'Clinical Research' | 'Recalls';
  thumbnailUrl?: string | null;
  imageCaption?: string | null;
  summary: string;
  evidenceBrief: {
    overview: string;
    studyType?: string;
    population?: string;
    intervention?: string;
    outcome?: string;
    limitations?: string;
    repurposingRelevance?: string;
  };
  whatThisDoesNotEstablish: string[];
  citation: {
    title: string;
    publisher: string;
    date: string;
    identifier?: string;
    sourceUrl: string;
  };
  isAIAssisted: boolean;
}

