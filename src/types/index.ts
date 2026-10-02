export type EvidenceStatus = 
  | 'Approved' 
  | 'Investigational' 
  | 'Off-label' 
  | 'Preclinical' 
  | 'Unsupported';

export interface SourceProvenance {
  name: 'RxNorm' | 'openFDA' | 'PubChem' | 'ClinicalTrials.gov' | 'PubMed';
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
  lastVerifiedDate: string;
  sources: SourceProvenance[];
}

export interface ClinicalTrial {
  nctId: string;
  title: string;
  phase: string;
  status: string; // RECRUITING, COMPLETED, ACTIVE_NOT_RECRUITING, TERMINATED, WITHDRAWN, etc.
  conditions: string[];
  leadSponsor: string;
  studyUrl: string;
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

export interface EvidenceScoreBreakdown {
  clinicalTrialScore: number;      // 0 - 40
  humanObservationalScore: number; // 0 - 20
  mechanisticScore: number;        // 0 - 20
  reproducibilityScore: number;    // 0 - 10
  safetyCompatibilityScore: number;// 0 - 10
  totalScore: number;              // 0 - 100
  contributingFactors: string[];
  uncertaintyFlags: string[];
}

export interface RepurposingCandidate {
  id: string;
  condition: string;
  status: EvidenceStatus;
  highestPhase: string;
  evidenceScore: EvidenceScoreBreakdown;
  clinicalTrials: ClinicalTrial[];
  citations: PubMedCitation[];
  biologicalRationale: string;
  safetyNotes: string[];
  sourceCount: number;
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
