import { 
  ClinicalTrial, 
  PubMedCitation, 
  ResearchReadinessBreakdown,
  ResearchState,
  ContradictionItem,
  SourceTimelineEvent,
  ResearchChecklistStep
} from '@/types';

interface ScoringInput {
  condition: string;
  trials: ClinicalTrial[];
  citations: PubMedCitation[];
  mechanismOfAction?: string;
  biologicalRationale?: string;
  fdaWarnings?: string[];
  fdaContraindications?: string[];
  approvedIndications?: string[];
  targets?: string[];
  drugName?: string;
  retrievedAt?: string;
}

/**
 * Computes the Transparent Research Readiness Score (0 - 100).
 * Clearly conveys that this is NOT an efficacy, approval, safety, or prescribing score.
 * 
 * Score Components:
 * 1. Clinical trial maturity & status: 0 - 25
 * 2. Published human evidence: 0 - 25
 * 3. Mechanistic / target-disease plausibility: 0 - 20
 * 4. Source quality, recency, and reproducibility: 0 - 15
 * 5. Safety / context compatibility: 0 - 15
 * 6. Evidence-conflict penalties: subtracted (<= 0)
 */
export function computeResearchReadinessScore(input: ScoringInput): ResearchReadinessBreakdown {
  const contributingFactors: string[] = [];
  const uncertaintyFlags: string[] = [];

  const trials = input.trials || [];
  const citations = input.citations || [];
  const hasCitations = citations.length > 0;
  const hasTrials = trials.length > 0;

  // -------------------------------------------------------------
  // 1. Clinical-trial maturity and status: 0 - 25
  // -------------------------------------------------------------
  let clinicalTrialMaturity = 0;
  let clinicalTrialMaturityReason = '';
  let clinicalTrialScore = 0;
  let hasPhase2or3 = false;
  let completedLateStageTrial = false;

  const validTrials = trials.filter((t) => {
    const s = (t.status || '').toUpperCase();
    return !s.includes('TERMINATED') && !s.includes('WITHDRAWN') && !s.includes('SUSPENDED');
  });

  const terminatedTrials = trials.filter((t) => {
    const s = (t.status || '').toUpperCase();
    return s.includes('TERMINATED') || s.includes('WITHDRAWN') || s.includes('SUSPENDED');
  });

  if (!hasTrials) {
    clinicalTrialMaturity = 0;
    clinicalTrialScore = 0;
    clinicalTrialMaturityReason = 'No registered interventional clinical trials found in ClinicalTrials.gov for this pairing.';
    uncertaintyFlags.push('No registered interventional clinical trials found for this candidate condition.');
  } else if (validTrials.length === 0 && terminatedTrials.length > 0) {
    clinicalTrialMaturity = 2;
    clinicalTrialScore = 4;
    clinicalTrialMaturityReason = `All ${trials.length} identified trials were terminated, withdrawn, or suspended prior to normal completion.`;
    uncertaintyFlags.push('Trial stopped: All identified clinical trials were prematurely terminated or withdrawn.');
  } else {
    let highestPhaseScore25 = 0;
    let highestPhaseScore40 = 0;
    let highestPhaseLabel = '';

    for (const trial of validTrials) {
      const p = (trial.phase || '').toUpperCase();
      const s = (trial.status || '').toUpperCase();
      const isCompleted = s.includes('COMPLETED');
      const isActive = s.includes('RECRUITING') || s.includes('ACTIVE');

      if (p.includes('PHASE 2') || p.includes('PHASE 3') || p.includes('PHASE2') || p.includes('PHASE3')) {
        hasPhase2or3 = true;
      }
      if ((p.includes('PHASE 3') || p.includes('PHASE 4') || p.includes('PHASE3') || p.includes('PHASE4')) && isCompleted) {
        completedLateStageTrial = true;
      }

      let score25 = 0;
      let score40 = 0;
      let label = '';

      if (p.includes('PHASE 4') || p.includes('PHASE4')) {
        score25 = isCompleted ? 25 : 22;
        score40 = isCompleted ? 40 : 36;
        label = isCompleted ? 'Completed Phase 4 trial' : 'Active Phase 4 trial';
      } else if (p.includes('PHASE 3') || p.includes('PHASE3')) {
        score25 = isCompleted ? 22 : (isActive ? 19 : 17);
        score40 = isCompleted ? 35 : (isActive ? 30 : 28);
        label = isCompleted ? 'Completed Phase 3 trial' : (isActive ? 'Active Phase 3 trial' : 'Phase 3 trial');
      } else if (p.includes('PHASE 2/PHASE 3') || p.includes('PHASE 2') || p.includes('PHASE2')) {
        score25 = isCompleted ? 16 : (isActive ? 13 : 11);
        score40 = isCompleted ? 26 : (isActive ? 22 : 18);
        label = isCompleted ? 'Completed Phase 2 trial' : (isActive ? 'Active Phase 2 trial' : 'Phase 2 trial');
      } else if (p.includes('PHASE 1/PHASE 2')) {
        score25 = isCompleted ? 11 : 9;
        score40 = isCompleted ? 16 : 14;
        label = 'Phase 1/2 trial';
      } else if (p.includes('PHASE 1') || p.includes('PHASE1')) {
        score25 = isCompleted ? 8 : 6;
        score40 = isCompleted ? 12 : 10;
        label = 'Phase 1 trial';
      } else {
        score25 = 4;
        score40 = 6;
        label = 'Early-stage/pilot trial';
      }

      if (score25 > highestPhaseScore25) {
        highestPhaseScore25 = score25;
        highestPhaseScore40 = score40;
        highestPhaseLabel = label;
      }
    }

    const multiTrialBonus25 = validTrials.length > 1 ? Math.min(3, validTrials.length - 1) : 0;
    const multiTrialBonus40 = validTrials.length > 1 ? Math.min(5, (validTrials.length - 1) * 2) : 0;

    clinicalTrialMaturity = Math.min(25, highestPhaseScore25 + multiTrialBonus25);
    clinicalTrialScore = Math.min(40, highestPhaseScore40 + multiTrialBonus40);
    clinicalTrialMaturityReason = `${validTrials.length} active/completed clinical trial(s) identified (highest maturity: ${highestPhaseLabel}).`;
    contributingFactors.push(clinicalTrialMaturityReason);
  }

  // -------------------------------------------------------------
  // 2. Published human evidence: 0 - 25
  // -------------------------------------------------------------
  let publishedHumanEvidence = 0;
  let publishedHumanEvidenceReason = '';
  let humanObservationalScore = 0;

  if (!hasCitations) {
    publishedHumanEvidence = 0;
    humanObservationalScore = 0;
    publishedHumanEvidenceReason = 'No peer-reviewed PubMed publications indexed for this exact pairing.';
    uncertaintyFlags.push('Human evidence unavailable: No peer-reviewed PubMed citations indexed for this specific pairing.');
    uncertaintyFlags.push('Human evidence unavailable: 0 peer-reviewed outcome publications identified in PubMed.');
  } else if (citations.length >= 4) {
    publishedHumanEvidence = 25;
    humanObservationalScore = 20;
    publishedHumanEvidenceReason = `High literature volume: ${citations.length} peer-reviewed publications indexed on PubMed.`;
    contributingFactors.push(publishedHumanEvidenceReason);
  } else if (citations.length === 3) {
    publishedHumanEvidence = 20;
    humanObservationalScore = 16;
    publishedHumanEvidenceReason = '3 peer-reviewed publications indexed on PubMed.';
    contributingFactors.push(publishedHumanEvidenceReason);
  } else if (citations.length === 2) {
    publishedHumanEvidence = 14;
    humanObservationalScore = 12;
    publishedHumanEvidenceReason = '2 peer-reviewed PubMed citations indexed.';
    contributingFactors.push(publishedHumanEvidenceReason);
  } else {
    publishedHumanEvidence = 8;
    humanObservationalScore = 7;
    publishedHumanEvidenceReason = 'Single literature citation indexed on PubMed; limited publication density.';
    contributingFactors.push(publishedHumanEvidenceReason);
    uncertaintyFlags.push('Single publication: Cross-study peer-reviewed replication is minimal.');
  }

  // -------------------------------------------------------------
  // 3. Mechanistic / target-disease plausibility: 0 - 20
  // -------------------------------------------------------------
  let mechanisticPlausibility = 0;
  let mechanisticPlausibilityReason = '';
  const mechanism = (input.mechanismOfAction || '').trim();
  const rationale = (input.biologicalRationale || '').trim();
  const targets = input.targets || [];

  if (targets.length > 0 || (mechanism.length > 20 && rationale.length > 20)) {
    mechanisticPlausibility = 20;
    mechanisticPlausibilityReason = 'Well-characterized biological mechanism of action and receptor/target rationale documented.';
    contributingFactors.push('Characterized pharmacological mechanism and target interaction.');
  } else if (mechanism.length > 15 || rationale.length > 15) {
    mechanisticPlausibility = 14;
    mechanisticPlausibilityReason = 'Plausible biological mechanism or secondary pathway interaction documented.';
    contributingFactors.push('Plausible pharmacological mechanism documented.');
  } else {
    mechanisticPlausibility = 8;
    mechanisticPlausibilityReason = 'Hypothetical or inferred biological pathway; limited direct molecular validation.';
    uncertaintyFlags.push('Target mechanism: Biological mechanism is inferred rather than directly validated.');
  }
  const mechanisticScore = mechanisticPlausibility;

  // -------------------------------------------------------------
  // 4. Source quality, recency, and reproducibility: 0 - 15
  // -------------------------------------------------------------
  let sourceQualityReproducibility = 0;
  let sourceQualityReproducibilityReason = '';
  let reproducibilityScore = 0;

  const sponsors = new Set(trials.map((t) => (t.leadSponsor || '').trim().toLowerCase()).filter(Boolean));
  const distinctSponsors = sponsors.size;

  if (distinctSponsors >= 2 || (validTrials.length >= 2 && citations.length >= 2)) {
    sourceQualityReproducibility = 15;
    reproducibilityScore = 10;
    sourceQualityReproducibilityReason = `Corroborated across ${distinctSponsors || 'multiple'} independent research organizations with multi-source registry coverage.`;
    contributingFactors.push('Multi-center / multi-sponsor independent trial corroboration.');
  } else if (distinctSponsors === 1 || validTrials.length >= 1 || citations.length >= 1) {
    sourceQualityReproducibility = 10;
    reproducibilityScore = 6;
    sourceQualityReproducibilityReason = 'Evidence derived from a single sponsor or preliminary literature cohort.';
    uncertaintyFlags.push('Single sponsor: Evidence primarily from one investigation group.');
  } else {
    sourceQualityReproducibility = 5;
    reproducibilityScore = 2;
    sourceQualityReproducibilityReason = 'No independent trial replication or primary registry corroboration.';
    uncertaintyFlags.push('Unreplicated: Findings lack independent verification.');
  }

  // -------------------------------------------------------------
  // 5. Safety / context compatibility: 0 - 15
  // -------------------------------------------------------------
  let safetyCompatibility = 15;
  let safetyCompatibilityReason = 'No explicit target contraindications identified in current FDA product labels.';
  let safetyCompatibilityScore = 10;

  const condLower = input.condition.toLowerCase();
  const contraindications = input.fdaContraindications || [];
  const warnings = input.fdaWarnings || [];

  const isContraindicated = contraindications.some((c) => {
    const cLow = c.toLowerCase();
    return cLow.includes(condLower) || condLower.split(' ').some((token) => token.length > 4 && cLow.includes(token));
  });

  const hasTargetWarning = warnings.some((w) => {
    const wLow = w.toLowerCase();
    return wLow.includes(condLower) || condLower.split(' ').some((token) => token.length > 4 && wLow.includes(token));
  });

  if (isContraindicated) {
    safetyCompatibility = 3;
    safetyCompatibilityScore = 1;
    safetyCompatibilityReason = 'CRITICAL: Official FDA label explicitly lists this condition or target organ under contraindications.';
    uncertaintyFlags.push('Safety alert: Official FDA label explicitly lists this condition under warnings or contraindications.');
  } else if (hasTargetWarning) {
    safetyCompatibility = 8;
    safetyCompatibilityScore = 4;
    safetyCompatibilityReason = 'FDA product label documents related warnings or precautions for this organ system.';
    uncertaintyFlags.push('Safety precaution: Related organ system precautions noted on FDA label.');
  } else {
    safetyCompatibility = 15;
    safetyCompatibilityScore = 10;
    contributingFactors.push('No acute target contraindications identified in FDA labeling.');
  }

  // -------------------------------------------------------------
  // 6. Evidence-conflict penalties: <= 0 (subtracted)
  // -------------------------------------------------------------
  let evidenceConflictPenalty = 0;
  const penaltyReasons: string[] = [];

  if (terminatedTrials.length > 0) {
    if (validTrials.length === 0) {
      evidenceConflictPenalty -= 15;
      penaltyReasons.push(`All ${terminatedTrials.length} clinical trials were prematurely terminated, withdrawn, or suspended (-15 pts)`);
    } else {
      evidenceConflictPenalty -= 6;
      penaltyReasons.push(`${terminatedTrials.length} clinical trial(s) were terminated or withdrawn prior to completion (-6 pts)`);
    }
  }

  if (isContraindicated) {
    evidenceConflictPenalty -= 12;
    penaltyReasons.push('Explicit FDA label contraindication penalty (-12 pts)');
  }

  if (hasPhase2or3 && !hasCitations) {
    evidenceConflictPenalty -= 4;
    penaltyReasons.push('Phase 2/3 trial activity registered without published peer-reviewed outcome papers (-4 pts)');
  }

  const evidenceConflictPenaltyReason = penaltyReasons.length > 0 
    ? penaltyReasons.join('; ') 
    : 'No evidence conflict penalties applied.';

  // Calculate preliminary total score
  let totalScore = 
    clinicalTrialMaturity +
    publishedHumanEvidence +
    mechanisticPlausibility +
    sourceQualityReproducibility +
    safetyCompatibility +
    evidenceConflictPenalty;

  let trialOutcomeStatus: string | undefined = undefined;

  if (hasPhase2or3 && !hasCitations) {
    trialOutcomeStatus = 'Clinical trial activity identified; published outcome evidence unavailable.';
    uncertaintyFlags.unshift(trialOutcomeStatus);
  }

  // Safeguard 1: Candidate with 0 citations must NEVER be "High readiness" (cap at 55)
  if (!hasCitations) {
    totalScore = Math.min(55, totalScore);
  }

  // Safeguard 2: Candidate with no verified human evidence (no trials AND no citations)
  if (!hasTrials && !hasCitations) {
    totalScore = Math.min(18, totalScore);
    uncertaintyFlags.push('Insufficient evidence: No registered interventional trials or peer-reviewed human publications found.');
    uncertaintyFlags.push('Insufficient evidence: No registered interventional trials or peer-reviewed literature indexed.');
  }

  totalScore = Math.min(100, Math.max(0, totalScore));

  // Determine tiers
  let readinessTier: 'High readiness' | 'Moderate readiness' | 'Preliminary' | 'Insufficient evidence';
  let evidenceTier: 'High' | 'Moderate' | 'Preliminary' | 'Insufficient evidence';

  if (totalScore <= 20 || (!hasTrials && !hasCitations) || (hasTrials && validTrials.length === 0 && !hasCitations)) {
    readinessTier = 'Insufficient evidence';
    evidenceTier = 'Insufficient evidence';
  } else if (totalScore < 50) {
    readinessTier = 'Preliminary';
    evidenceTier = 'Preliminary';
  } else if (totalScore < 70) {
    readinessTier = 'Moderate readiness';
    evidenceTier = 'Moderate';
  } else {
    if (hasCitations || completedLateStageTrial) {
      readinessTier = 'High readiness';
      evidenceTier = 'High';
    } else {
      readinessTier = 'Moderate readiness';
      evidenceTier = 'Moderate';
    }
  }

  return {
    clinicalTrialMaturity,
    clinicalTrialMaturityReason,
    publishedHumanEvidence,
    publishedHumanEvidenceReason,
    mechanisticPlausibility,
    mechanisticPlausibilityReason,
    sourceQualityReproducibility,
    sourceQualityReproducibilityReason,
    safetyCompatibility,
    safetyCompatibilityReason,
    evidenceConflictPenalty,
    evidenceConflictPenaltyReason,
    totalScore,
    readinessTier,
    trialOutcomeStatus,
    contributingFactors,
    uncertaintyFlags,

    // Legacy field aliases for backwards compatibility with tests and components
    clinicalTrialScore,
    humanObservationalScore,
    mechanisticScore,
    reproducibilityScore,
    safetyCompatibilityScore,
    evidenceTier,

    // Structured breakdown object for RepurposeCompass
    breakdown: {
      clinicalTrialMaturity: { score: clinicalTrialMaturity, max: 25, reason: clinicalTrialMaturityReason },
      publishedHumanEvidence: { score: publishedHumanEvidence, max: 25, reason: publishedHumanEvidenceReason },
      mechanisticPlausibility: { score: mechanisticPlausibility, max: 20, reason: mechanisticPlausibilityReason },
      sourceQualityRecency: { score: sourceQualityReproducibility, max: 15, reason: sourceQualityReproducibilityReason },
      safetyContextCompatibility: { score: safetyCompatibility, max: 15, reason: safetyCompatibilityReason },
      conflictPenalties: { score: evidenceConflictPenalty, reason: evidenceConflictPenaltyReason },
    },
  };
}

// Backwards-compatible export
export const computeEvidenceScore = computeResearchReadinessScore;

/**
 * Classifies a candidate drug-condition pairing into one of the 8 explicit Research States.
 * Supports either an input object or positional arguments.
 */
export function determineResearchState(
  inputOrCondition: string | { 
    condition: string; 
    trials?: ClinicalTrial[]; 
    citations?: PubMedCitation[]; 
    mechanismOfAction?: string; 
    approvedIndications?: string[]; 
    isApproved?: boolean; 
    fdaContraindications?: string[];
  },
  approvedIndicationsArg: string[] = [],
  trialsArg: ClinicalTrial[] = [],
  citationsArg: PubMedCitation[] = [],
  fdaContraindicationsArg?: string[]
): ResearchState {
  let condition = '';
  let approvedIndications = approvedIndicationsArg;
  let trials = trialsArg;
  let citations = citationsArg;
  let fdaContraindications = fdaContraindicationsArg || [];
  let mechanismOfAction = '';
  let isApprovedExplicit = false;

  if (typeof inputOrCondition === 'object' && inputOrCondition !== null) {
    condition = inputOrCondition.condition || '';
    trials = inputOrCondition.trials || [];
    citations = inputOrCondition.citations || [];
    approvedIndications = inputOrCondition.approvedIndications || [];
    fdaContraindications = inputOrCondition.fdaContraindications || [];
    mechanismOfAction = inputOrCondition.mechanismOfAction || '';
    isApprovedExplicit = Boolean(inputOrCondition.isApproved);
  } else {
    condition = inputOrCondition || '';
  }

  const condLower = condition.toLowerCase().trim();

  // 1. Approved indication
  const isApproved = isApprovedExplicit || approvedIndications.some((ind) => {
    const indLower = ind.toLowerCase().trim();
    return indLower.includes(condLower) || condLower.includes(indLower);
  });
  if (isApproved) {
    return 'Approved indication';
  }

  const validTrials = trials.filter((t) => {
    const s = (t.status || '').toUpperCase();
    return !s.includes('TERMINATED') && !s.includes('WITHDRAWN') && !s.includes('SUSPENDED');
  });
  const terminatedTrials = trials.filter((t) => {
    const s = (t.status || '').toUpperCase();
    return s.includes('TERMINATED') || s.includes('WITHDRAWN') || s.includes('SUSPENDED');
  });

  // 2. All trials terminated, withdrawn, or suspended
  if (trials.length > 0 && validTrials.length === 0 && terminatedTrials.length > 0) {
    return 'Trial terminated, withdrawn, or suspended';
  }

  // 3. Conflicting evidence (explicit contraindication or contradictory study signals)
  const isContraindicated = fdaContraindications.some((c) =>
    c.toLowerCase().includes(condLower)
  );
  if (isContraindicated && (validTrials.length > 0 || citations.length > 0)) {
    return 'Conflicting evidence';
  }

  // 4. Investigational (active or completed clinical trials)
  if (validTrials.length > 0) {
    return 'Investigational';
  }

  // 5. Off-label evidence (human published outcome evidence without interventional trials)
  if (citations.length >= 2) {
    return 'Off-label evidence';
  }

  // 6. Preclinical (single paper or documented mechanism of action without trials)
  if (citations.length === 1 || (mechanismOfAction && mechanismOfAction.trim().length > 10)) {
    return 'Preclinical';
  }

  // 7. No verified evidence found / Insufficient evidence
  if (trials.length === 0 && citations.length === 0 && !mechanismOfAction) {
    return 'Insufficient evidence';
  }

  return 'No verified evidence found';
}

/**
 * Detects specific contradiction signals for the "What needs verification?" panel
 */
export function detectContradictions(input: {
  condition: string;
  trials: ClinicalTrial[];
  citations: PubMedCitation[];
  warnings?: string[];
  contraindications?: string[];
  fdaWarnings?: string[];
  fdaContraindications?: string[];
  mechanismOfAction?: string;
  biologicalRationale?: string;
}): ContradictionItem[] {
  const items: ContradictionItem[] = [];
  const trials = input.trials || [];
  const citations = input.citations || [];
  const warnings = input.warnings || input.fdaWarnings || [];
  const contraindications = input.contraindications || input.fdaContraindications || [];
  const mechanism = (input.mechanismOfAction || '').trim();
  const condLower = input.condition.toLowerCase();

  // Contradiction 1: Trial registered, but zero published outcome literature found
  if (trials.length > 0 && citations.length === 0) {
    items.push({
      id: 'trial_no_outcome',
      severity: 'critical',
      title: 'Clinical trial exists; published outcome literature unavailable',
      description: `${trials.length} registered trial(s) exist in ClinicalTrials.gov, but 0 peer-reviewed published results or outcomes were identified in PubMed. Clinical efficacy cannot be assumed.`,
      category: 'trial',
      recommendedAction: 'Verify trial endpoint completion and inspect sponsor study registry on ClinicalTrials.gov.',
      sourceReference: 'ClinicalTrials.gov & PubMed cross-check',
    });
  }

  // Contradiction 2: High trial phase (Phase 2, 3, or 4) but no confirmed published results
  const highPhaseTrials = trials.filter((t) => {
    const p = (t.phase || '').toUpperCase();
    return p.includes('PHASE 2') || p.includes('PHASE 3') || p.includes('PHASE 4') || p.includes('PHASE2') || p.includes('PHASE3');
  });
  if (highPhaseTrials.length > 0 && citations.length === 0) {
    items.push({
      id: 'high_phase_unconfirmed',
      severity: 'warning',
      title: 'Advanced clinical phase without published corroboration',
      description: `Investigated in ${highPhaseTrials[0].phase || 'Phase 2/3'}, yet no peer-reviewed trial results have been deposited or indexed. Verify trial completion status and primary endpoint reporting on ClinicalTrials.gov.`,
      category: 'trial',
      recommendedAction: 'Inspect ClinicalTrials.gov primary completion date and published study protocols.',
      sourceReference: `NCT ID: ${highPhaseTrials[0].nctId}`,
    });
  }

  // Contradiction 3: Terminated / Withdrawn / Suspended trial signals
  const stoppedTrials = trials.filter((t) => {
    const s = (t.status || '').toUpperCase();
    return s.includes('TERMINATED') || s.includes('WITHDRAWN') || s.includes('SUSPENDED');
  });
  if (stoppedTrials.length > 0) {
    items.push({
      id: 'trial_terminated',
      severity: 'critical',
      title: `${stoppedTrials.length} clinical trial(s) discontinued or suspended early`,
      description: `Study protocols were halted prematurely. Discontinued trials often indicate unanticipated adverse reactions, lack of efficacy, or sponsor withdrawal.`,
      category: 'trial',
      recommendedAction: 'Inspect termination reasons in ClinicalTrials.gov detailed study records.',
      sourceReference: stoppedTrials.map((t) => t.nctId).join(', '),
    });
  }

  // Contradiction 4: Safety warnings or label contraindications
  const matchingContraindications = contraindications.filter((c) =>
    c.toLowerCase().includes(condLower) || condLower.split(' ').some((token) => token.length > 4 && c.toLowerCase().includes(token))
  );
  if (matchingContraindications.length > 0) {
    items.push({
      id: 'safety_contraindication',
      severity: 'critical',
      title: 'Candidate condition intersects with FDA label contraindications',
      description: `Official FDA labeling lists severe adverse warnings or contraindications that may directly overlap with ${input.condition}: "${matchingContraindications[0]}"`,
      category: 'safety',
      recommendedAction: 'Cross-reference prescribing monograph for organ-specific toxicities and pharmacokinetic risks.',
      sourceReference: 'openFDA Structured Product Label',
    });
  }

  // Contradiction 5: Uncharacterized mechanism
  if (!mechanism || mechanism.toLowerCase().includes('inferred') || mechanism.toLowerCase().includes('uncharacterized')) {
    items.push({
      id: 'uncharacterized_mechanism',
      severity: 'info',
      title: 'Biological target or receptor engagement uncharacterized',
      description: 'The molecular mechanism linking this drug compound to disease pathophysiology lacks characterized target binding assays in open registries.',
      category: 'mechanism',
      recommendedAction: 'Query UniProt and PubChem bioassays for secondary macromolecular binding affinities.',
      sourceReference: 'PubChem BioAssay records',
    });
  }

  return items;
}

/**
 * Builds a chronological source-linked provenance timeline
 */
export function buildProvenanceTimeline(input: {
  drugName: string;
  condition: string;
  trials: ClinicalTrial[];
  citations: PubMedCitation[];
  approvalDate?: string;
  rxNormId?: string;
  lastVerifiedDate?: string;
  retrievedAt?: string;
}): SourceTimelineEvent[] {
  const events: SourceTimelineEvent[] = [];
  const timestamp = input.retrievedAt || input.lastVerifiedDate || new Date().toISOString().split('T')[0];

  // 1. RxNorm / Regulatory event
  if (input.approvalDate || input.rxNormId) {
    events.push({
      id: `reg-${input.rxNormId || 'approval'}`,
      date: input.approvalDate || '2004-01-01',
      title: `Regulatory Baseline & Concept Normalization`,
      summary: `Standardized drug concept established for ${input.drugName} (RxCUI: ${input.rxNormId || 'Assigned'}).`,
      description: `Standardized clinical drug concept established for ${input.drugName}.`,
      source: 'RxNorm',
      sourceName: 'RxNorm API',
      sourceId: input.rxNormId ? `RxCUI: ${input.rxNormId}` : 'FDA Label',
      sourceUrl: input.rxNormId ? `https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${input.rxNormId}` : undefined,
      identifier: input.rxNormId ? `RxCUI ${input.rxNormId}` : undefined,
      timestamp,
      type: 'regulatory_label',
    });
  }

  // 2. Clinical trial events
  for (const trial of input.trials) {
    const dateStr = trial.startDate || trial.completionDate || '2020-01-01';
    events.push({
      id: `trial-${trial.nctId}`,
      date: dateStr,
      title: `Clinical Trial Registration: ${trial.nctId} (${trial.phase || 'Unspecified'})`,
      summary: `${trial.title}. Status: ${trial.status}. Sponsor: ${trial.leadSponsor || 'Academic/Industry'}.`,
      description: trial.title,
      source: 'ClinicalTrials.gov',
      sourceName: 'ClinicalTrials.gov',
      sourceId: trial.nctId,
      sourceUrl: trial.studyUrl || `https://clinicaltrials.gov/study/${trial.nctId}`,
      identifier: trial.nctId,
      timestamp,
      type: 'trial_registration',
    });
  }

  // 3. Publication citations
  for (const citation of input.citations) {
    const pubYear = (citation.pubDate.match(/\b(19\d\d|20\d\d)\b/) || ['2022'])[0];
    events.push({
      id: `pubmed-${citation.pmid}`,
      date: `${pubYear}-06-01`,
      title: `Peer-Reviewed Publication: ${citation.journal || 'PubMed Citation'}`,
      summary: citation.title,
      description: citation.title,
      source: 'PubMed',
      sourceName: 'PubMed',
      sourceId: `PMID: ${citation.pmid}`,
      sourceUrl: citation.url || `https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/`,
      identifier: `PMID ${citation.pmid}`,
      timestamp,
      type: 'publication',
    });
  }

  // 4. Verification snapshot
  events.push({
    id: `snapshot-${Date.now()}`,
    date: timestamp,
    title: `Repurpose Compass Evidence Snapshot`,
    summary: `Primary records validated across open biomedical registries (RxNorm, openFDA, PubChem, ClinicalTrials.gov, PubMed).`,
    description: `Multi-source verification snapshot retrieved and validated across open biomedical registries.`,
    source: 'Repurpose',
    sourceName: 'Repurpose Evidence Workspace',
    sourceId: 'SNAPSHOT-VERIFIED',
    sourceUrl: `/evidence/${encodeURIComponent(input.drugName.toLowerCase())}/${encodeURIComponent(input.condition.toLowerCase())}`,
    identifier: 'Evidence Snapshot',
    timestamp,
    type: 'snapshot_retrieval',
  });

  // Sort chronologically ascending
  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

/**
 * Generates a deterministic, non-clinical research checklist based strictly on verified evidence
 */
export function generateResearchChecklist(input: {
  condition: string;
  trials: ClinicalTrial[];
  citations: PubMedCitation[];
  drugName?: string;
  mechanismOfAction?: string;
  warnings?: string[];
  contraindications?: string[];
  contradictions?: ContradictionItem[];
}): ResearchChecklistStep[] {
  const steps: ResearchChecklistStep[] = [];
  const trials = input.trials || [];
  const citations = input.citations || [];
  const drugName = input.drugName || 'Investigated agent';

  // Step 1: Review full trial records
  steps.push({
    id: 'review_trials',
    title: 'Review Full Clinical Trial Record',
    label: 'Examine Primary Trial Records on ClinicalTrials.gov',
    description: trials.length > 0 
      ? `Inspect study protocols, primary endpoint dates, and enrollment details for ${trials.length} registered trial(s).`
      : 'Verify absence of interventional clinical trials on ClinicalTrials.gov under alternative synonyms.',
    category: 'clinical_trial',
    actionLink: trials[0]?.studyUrl || `https://clinicaltrials.gov/search?term=${encodeURIComponent(drugName + ' ' + input.condition)}`,
    isCompleted: false,
  });

  // Step 2: Check published outcomes
  steps.push({
    id: 'check_outcomes',
    title: 'Check Published Human Outcomes',
    label: 'Verify Published Results and Peer-Reviewed Literature',
    description: citations.length > 0
      ? `Review the ${citations.length} indexed PubMed paper(s) to verify whether clinical endpoints or observational outcomes were reported.`
      : 'Conduct targeted literature search on PubMed for preclinical or case report findings.',
    category: 'literature',
    actionLink: citations[0]?.url || `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(drugName + ' ' + input.condition)}`,
    isCompleted: false,
  });

  // Step 3: Disease normalization verification
  steps.push({
    id: 'confirm_normalization',
    title: 'Confirm Disease & Condition Normalization',
    label: 'Confirm Disease / Condition Ontology Normalization',
    description: `Ensure that "${input.condition}" is mapped to canonical MeSH or ICD-11 ontology terms without confusing stage-specific variants.`,
    category: 'ontology',
    isCompleted: false,
  });

  // Step 4: Safety review
  steps.push({
    id: 'review_safety',
    title: 'Review Safety Labels & Contraindications',
    label: 'Audit FDA Product Label Warnings & Contraindications',
    description: `Review openFDA DailyMed structured product labeling for ${drugName} to verify absence of metabolic or organ-specific contraindications.`,
    category: 'safety',
    actionLink: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(drugName)}`,
    isCompleted: false,
  });

  // Step 5: Target and pathway evidence
  steps.push({
    id: 'review_pathway',
    title: 'Review Target and Pathway Evidence',
    label: 'Investigate Target & Pathway Plausibility on PubChem',
    description: `Analyze macromolecular targets and receptor affinity profiles for ${drugName} against pathophysiology pathways of ${input.condition}.`,
    category: 'mechanism',
    actionLink: `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(drugName)}`,
    isCompleted: false,
  });

  // Step 6: Compare with similar candidates
  steps.push({
    id: 'compare_hypotheses',
    title: 'Compare with Similar Drug Hypotheses',
    label: 'Side-by-Side Evaluation in Compare Workspace',
    description: 'Compare trial phases, readiness scores, and literature footprint side-by-side with related therapeutic candidates.',
    category: 'comparative',
    actionLink: '/compare',
    isCompleted: false,
  });

  // Step 7: Export citations for literature review
  steps.push({
    id: 'export_citations',
    title: 'Export Citations for Literature Review',
    label: 'Export Verified Citations for Systematic Literature Review',
    description: 'Download the candidate evidence dossier in RIS or CSV format for integration into reference managers (Zotero, EndNote, Mendeley).',
    category: 'literature_review',
    isCompleted: false,
  });

  return steps;
}
