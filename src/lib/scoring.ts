import { ClinicalTrial, PubMedCitation, EvidenceScoreBreakdown } from '@/types';

interface ScoringInput {
  condition: string;
  trials: ClinicalTrial[];
  citations: PubMedCitation[];
  mechanismOfAction?: string;
  biologicalRationale?: string;
  fdaWarnings?: string[];
  fdaContraindications?: string[];
}

export function computeEvidenceScore(input: ScoringInput): EvidenceScoreBreakdown {
  const contributingFactors: string[] = [];
  const uncertaintyFlags: string[] = [];

  const trials = input.trials || [];
  const citations = input.citations || [];
  const hasCitations = citations.length > 0;
  const hasTrials = trials.length > 0;

  // 1. Clinical trial evidence: 0 - 40 points
  let clinicalTrialScore = 0;
  let hasPhase2or3 = false;
  let completedLateStageTrial = false;
  
  if (!hasTrials) {
    clinicalTrialScore = 0;
    uncertaintyFlags.push('No registered interventional clinical trials found for this candidate condition.');
  } else {
    const statuses = trials.map(t => (t.status || '').toUpperCase());
    
    const allTerminated = statuses.every(s => 
      s.includes('TERMINATED') || s.includes('WITHDRAWN') || s.includes('SUSPENDED')
    );

    if (allTerminated) {
      clinicalTrialScore = 4;
      contributingFactors.push(`Found ${trials.length} trial(s), but all were terminated, withdrawn, or suspended.`);
      uncertaintyFlags.push('Trial stopped: All identified clinical trials were prematurely terminated or withdrawn.');
    } else {
      let highestPoints = 0;
      let highestPhaseDesc = '';

      for (const trial of trials) {
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

        let trialPoints = 0;
        if (p.includes('PHASE 4') || p.includes('PHASE4')) {
          trialPoints = isCompleted ? 40 : 36;
          highestPhaseDesc = 'Phase 4';
        } else if (p.includes('PHASE 3') || p.includes('PHASE3')) {
          trialPoints = isCompleted ? 35 : (isActive ? 32 : 28);
          highestPhaseDesc = 'Phase 3';
        } else if (p.includes('PHASE 2/PHASE 3') || p.includes('PHASE 2') || p.includes('PHASE2')) {
          trialPoints = isCompleted ? 26 : (isActive ? 22 : 18);
          highestPhaseDesc = 'Phase 2';
        } else if (p.includes('PHASE 1/PHASE 2')) {
          trialPoints = isCompleted ? 18 : 15;
          highestPhaseDesc = 'Phase 1/2';
        } else if (p.includes('PHASE 1') || p.includes('PHASE1')) {
          trialPoints = isCompleted ? 14 : 10;
          highestPhaseDesc = 'Phase 1';
        } else {
          trialPoints = isCompleted ? 8 : 6;
          highestPhaseDesc = 'Early/Unclassified';
        }

        if (trialPoints > highestPoints) {
          highestPoints = trialPoints;
        }
      }

      // Bonus for multiple active/completed trials (up to +4 within 40 max)
      const validTrialsCount = trials.filter(t => 
        !['TERMINATED', 'WITHDRAWN'].some(s => (t.status || '').toUpperCase().includes(s))
      ).length;
      
      if (validTrialsCount > 1) {
        highestPoints = Math.min(40, highestPoints + Math.min(4, validTrialsCount));
        contributingFactors.push(`${validTrialsCount} interventional clinical trials registered (highest: ${highestPhaseDesc}).`);
      } else {
        contributingFactors.push(`1 registered clinical trial identified (${highestPhaseDesc}).`);
      }

      clinicalTrialScore = Math.min(40, highestPoints);

      if (clinicalTrialScore < 20) {
        uncertaintyFlags.push('Evidence is preliminary: Clinical trial progression is early-stage (Phase 1 or pilot).');
      }
    }
  }

  // 2. Human / Observational evidence: 0 - 20 points
  let humanObservationalScore = 0;

  if (!hasCitations) {
    humanObservationalScore = 0;
    uncertaintyFlags.push('Human evidence unavailable: No peer-reviewed PubMed citations indexed for this specific pairing.');
  } else {
    if (citations.length >= 4) {
      humanObservationalScore = 20;
      contributingFactors.push(`${citations.length} peer-reviewed PubMed citations indexed with clinical relevance.`);
    } else if (citations.length === 3) {
      humanObservationalScore = 16;
      contributingFactors.push(`3 peer-reviewed PubMed publications indexed.`);
    } else if (citations.length === 2) {
      humanObservationalScore = 12;
      contributingFactors.push(`2 peer-reviewed PubMed publications indexed.`);
    } else {
      humanObservationalScore = 7;
      contributingFactors.push(`1 peer-reviewed PubMed publication indexed.`);
      uncertaintyFlags.push('Limited publication volume: Only a single indexed literature citation found.');
    }
  }

  // 3. Mechanistic and target-disease plausibility: 0 - 20 points
  let mechanisticScore = 0;
  const mechanism = (input.mechanismOfAction || '').trim();
  const rationale = (input.biologicalRationale || '').trim();

  if (mechanism.length > 20 || rationale.length > 20) {
    if (mechanism.length > 50 && rationale.length > 30) {
      mechanisticScore = 20;
      contributingFactors.push('Characterized pharmacological mechanism aligned with disease pathway.');
    } else {
      mechanisticScore = 14;
      contributingFactors.push('Documented drug mechanism with biological hypothesis.');
    }
  } else {
    mechanisticScore = 5;
    uncertaintyFlags.push('Mechanistic hypothesis remains partially characterized or inferred.');
  }

  // 4. Reproducibility & publication quality signals: 0 - 10 points
  let reproducibilityScore = 0;
  const sponsors = new Set(trials.map(t => (t.leadSponsor || '').trim().toLowerCase()).filter(Boolean));
  
  if (sponsors.size >= 2) {
    reproducibilityScore = 10;
    contributingFactors.push(`Multiple independent study sponsors (${sponsors.size} distinct organizations).`);
  } else if (sponsors.size === 1) {
    reproducibilityScore = 6;
    contributingFactors.push('Single sponsor / single institution investigation.');
    uncertaintyFlags.push('Independent multi-center replication by external sponsors is limited.');
  } else if (citations.length >= 2) {
    reproducibilityScore = 5;
    contributingFactors.push('Supported by multiple scientific publication sources.');
  } else {
    reproducibilityScore = 2;
    uncertaintyFlags.push('Cross-institutional replication evidence is not yet established.');
  }

  // 5. Safety and contraindication compatibility: 0 - 10 points
  let safetyCompatibilityScore = 10;
  const warnings = input.fdaWarnings || [];
  const contraindications = input.fdaContraindications || [];
  const condLower = input.condition.toLowerCase();

  const hasDirectConflict = contraindications.some(c => 
    c.toLowerCase().includes(condLower)
  );

  const hasDirectWarning = warnings.some(w => 
    w.toLowerCase().includes(condLower)
  );

  if (hasDirectConflict) {
    safetyCompatibilityScore = 1;
    uncertaintyFlags.push('Safety alert: Official FDA label explicitly lists this condition or related pathophysiology as a contraindication.');
    contributingFactors.push('High-risk safety contraindication detected in official product labeling.');
  } else if (hasDirectWarning) {
    safetyCompatibilityScore = 5;
    uncertaintyFlags.push('Precaution: FDA boxed warning or precautions mention caution in this therapeutic domain.');
    contributingFactors.push('Specific FDA warning overlap identified; close monitoring required.');
  } else if (warnings.length > 0) {
    safetyCompatibilityScore = 9;
    contributingFactors.push('FDA safety warnings reviewed with no direct condition conflict.');
  } else {
    safetyCompatibilityScore = 8;
    contributingFactors.push('Baseline safety profile evaluated.');
  }

  let totalScore = 
    clinicalTrialScore + 
    humanObservationalScore + 
    mechanisticScore + 
    reproducibilityScore + 
    safetyCompatibilityScore;

  // -------------------------------------------------------------
  // CRITICAL SAFEGUARDS: Separate trial existence from outcome evidence
  // -------------------------------------------------------------
  let trialOutcomeStatus: string | undefined = undefined;

  // If Phase 2/3 trial activity exists but no published PubMed outcome literature was identified:
  if (hasPhase2or3 && !hasCitations) {
    trialOutcomeStatus = 'Clinical trial activity identified; published outcome evidence unavailable.';
    uncertaintyFlags.unshift('Clinical trial activity identified; published outcome evidence unavailable.');
  }

  // Safeguard: A candidate must NOT receive a "High" score (>= 70) when 0 citations are present,
  // unless an independently verified completed late-stage Phase 3/4 trial exists.
  if (!hasCitations && !completedLateStageTrial) {
    totalScore = Math.min(58, totalScore);
  }

  // Safeguard: If no trials AND no citations exist, cap score strictly and mark insufficient
  if (!hasTrials && !hasCitations) {
    totalScore = Math.min(20, totalScore);
    uncertaintyFlags.push('Insufficient evidence: No registered interventional trials or peer-reviewed human publications found.');
  }

  // Ensure score remains within bounds [0, 100]
  totalScore = Math.min(100, Math.max(0, totalScore));

  // Determine definitive Evidence Tier
  let evidenceTier: 'High' | 'Moderate' | 'Preliminary' | 'Insufficient evidence';
  if (totalScore < 30 || (!hasTrials && !hasCitations)) {
    evidenceTier = 'Insufficient evidence';
  } else if (totalScore < 50) {
    evidenceTier = 'Preliminary';
  } else if (totalScore < 70) {
    evidenceTier = 'Moderate';
  } else {
    // Only allow High if citations are documented OR completed Phase 3/4 trial exists
    if (hasCitations || completedLateStageTrial) {
      evidenceTier = 'High';
    } else {
      evidenceTier = 'Moderate';
    }
  }

  return {
    clinicalTrialScore,
    humanObservationalScore,
    mechanisticScore,
    reproducibilityScore,
    safetyCompatibilityScore,
    totalScore,
    evidenceTier,
    trialOutcomeStatus,
    contributingFactors,
    uncertaintyFlags,
  };
}
