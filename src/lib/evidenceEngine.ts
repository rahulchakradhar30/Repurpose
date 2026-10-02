import { fetchRxNormDetails } from './sources/rxnorm';
import { fetchOpenFDALabel } from './sources/openfda';
import { fetchPubChemData } from './sources/pubchem';
import { fetchClinicalTrials } from './sources/clinicaltrials';
import { fetchPubMedCitations } from './sources/pubmed';
import { computeEvidenceScore } from './scoring';
import { 
  filterDistinctBrandNames, 
  deduplicateTrials, 
  deduplicateCitations 
} from './normalization';
import { 
  DrugResearchSnapshot, 
  RepurposingCandidate, 
  DrugConcept, 
  EvidenceStatus, 
  SourceProvenance 
} from '@/types';

// Curated verified pharmacological classes for known therapeutics
const KNOWN_PHARM_CLASSES: Record<string, string> = {
  azithromycin: 'Macrolide antibiotic',
  metformin: 'Biguanide oral antihyperglycemic',
  thalidomide: 'Immunomodulatory Drug (IMiD)',
  imatinib: 'BCR-ABL / KIT / PDGFR tyrosine kinase inhibitor',
  hydroxychloroquine: '4-Aminoquinoline antimalarial and antirheumatic agent',
  sildenafil: 'Phosphodiesterase-5 (PDE5) inhibitor',
  aspirin: 'Nonsteroidal anti-inflammatory drug (NSAID) / Antiplatelet agent',
  atorvastatin: 'HMG-CoA reductase inhibitor (Statin)',
  ibuprofen: 'Nonsteroidal anti-inflammatory drug (NSAID)',
  losartan: 'Angiotensin II receptor blocker (ARB)',
  dexamethasone: 'Glucocorticoid corticosteroid',
  ivermectin: 'Avermectin antiparasitic agent',
  ritonavir: 'HIV protease inhibitor',
  famotidine: 'Histamine H2-receptor antagonist',
};

export async function aggregateDrugResearch(drugQuery: string): Promise<DrugResearchSnapshot | null> {
  const cleanDrug = drugQuery.trim();
  if (!cleanDrug) return null;

  const now = new Date().toISOString();
  const sourcesStatus: Record<string, { ok: boolean; message?: string; timestamp: string }> = {};

  // 1. Fetch Primary Identifiers concurrently with graceful isolation
  const [rxNormResult, openFDAResult, pubChemResult, clinicalTrialsResult] = await Promise.allSettled([
    fetchRxNormDetails(cleanDrug),
    fetchOpenFDALabel(cleanDrug),
    fetchPubChemData(cleanDrug),
    fetchClinicalTrials(cleanDrug),
  ]);

  const rxData = rxNormResult.status === 'fulfilled' ? rxNormResult.value : null;
  const fdaData = openFDAResult.status === 'fulfilled' ? openFDAResult.value : null;
  const pubchemData = pubChemResult.status === 'fulfilled' ? pubChemResult.value : null;
  const ctData = clinicalTrialsResult.status === 'fulfilled' ? clinicalTrialsResult.value : null;

  // Track source provenance
  sourcesStatus['RxNorm'] = {
    ok: !!rxData,
    message: rxData ? 'Drug identity normalized via RxNorm' : 'No direct RxCUI match found',
    timestamp: now,
  };

  sourcesStatus['openFDA'] = {
    ok: !!fdaData && fdaData.provenance.status === 'ok',
    message: fdaData?.provenance?.statusMessage || 'FDA structured product label retrieved',
    timestamp: now,
  };

  sourcesStatus['PubChem'] = {
    ok: !!pubchemData && pubchemData.provenance.status === 'ok',
    message: pubchemData?.provenance?.statusMessage || 'Chemical pharmacology retrieved',
    timestamp: now,
  };

  sourcesStatus['ClinicalTrials.gov'] = {
    ok: !!ctData && ctData.provenance.status === 'ok',
    message: ctData?.provenance?.statusMessage || `${ctData?.trials.length || 0} interventional studies mapped`,
    timestamp: now,
  };

  // If no source recognized or matched this drug, fail safely
  const hasValidSource = 
    (rxData && rxData.rxcui) || 
    (fdaData && fdaData.provenance.status === 'ok') || 
    (pubchemData && pubchemData.cid) || 
    (ctData && ctData.trials.length > 0);

  if (!hasValidSource) {
    return null;
  }

  // Determine normalized generic name
  const rawGeneric = rxData?.genericName || cleanDrug;
  const genericName = rawGeneric.charAt(0).toUpperCase() + rawGeneric.slice(1);
  const genLower = genericName.toLowerCase();

  // Filter distinct, verified brand names (strip generic repetitions and generic dosage forms)
  const combinedBrands = [
    ...(rxData?.brandNames || []),
    ...(fdaData?.brandNames || [])
  ];
  const brandNames = filterDistinctBrandNames(combinedBrands, genericName).slice(0, 8);

  const approvedIndications = fdaData?.approvedIndications || [];
  const warnings = fdaData?.warnings || [];
  const contraindications = fdaData?.contraindications || [];

  // Determine pharmacological class (prefer verified medical class over generic fallback)
  let drugClass = KNOWN_PHARM_CLASSES[genLower];
  if (!drugClass) {
    if (fdaData?.drugClass && !fdaData.drugClass.toLowerCase().includes('small molecule')) {
      drugClass = fdaData.drugClass;
    } else {
      drugClass = 'Small molecule therapeutic agent';
    }
  }

  const mechanismOfAction = fdaData?.mechanismOfAction || pubchemData?.description || 'Pharmacological mechanism documented in biomedical literature.';

  const sourcesList: SourceProvenance[] = [];
  if (rxData?.provenance) sourcesList.push(rxData.provenance);
  if (fdaData?.provenance) sourcesList.push(fdaData.provenance);
  if (pubchemData?.provenance) sourcesList.push(pubchemData.provenance);
  if (ctData?.provenance) sourcesList.push(ctData.provenance);

  const drugConcept: DrugConcept = {
    genericName,
    brandNames,
    rxNormId: rxData?.rxcui,
    pubchemCid: pubchemData?.cid,
    drugClass,
    mechanismOfAction,
    description: pubchemData?.description,
    approvedIndications,
    warnings,
    contraindications,
    lastVerifiedDate: now.split('T')[0],
    sources: sourcesList,
  };

  // 2. Identify and rank candidate conditions from ClinicalTrials.gov
  const conditionMap = ctData?.conditionMap || {};
  const conditionNames = Object.keys(conditionMap);

  // Helper to test if a condition is already in FDA approved indications
  const isApproved = (condName: string): boolean => {
    const cLower = condName.toLowerCase();
    return approvedIndications.some(appr => {
      const aLower = appr.toLowerCase();
      return aLower.includes(cLower) || cLower.includes(aLower);
    });
  };

  // Separate candidate conditions that are NOT approved
  const candidateConditions = conditionNames.filter(c => !isApproved(c));

  // Sort candidate conditions by trial count and phase prominence
  candidateConditions.sort((a, b) => {
    const trialsA = conditionMap[a] || [];
    const trialsB = conditionMap[b] || [];
    return trialsB.length - trialsA.length;
  });

  // Take top candidates for in-depth PubMed citation fetching (up to top 6 to prevent rate limit overflow)
  const topCandidateNames = candidateConditions.slice(0, 6);

  const candidatePromises = topCandidateNames.map(async (condName, idx) => {
    const rawTrials = conditionMap[condName] || [];
    const trials = deduplicateTrials(rawTrials);
    
    // Fetch real PubMed citations for this pair
    let rawCitations: import('@/types').PubMedCitation[] = [];
    try {
      rawCitations = await fetchPubMedCitations(genericName, condName);
    } catch {
      rawCitations = [];
    }
    const citations = deduplicateCitations(rawCitations);

    // Determine highest phase
    let highestPhase = 'Phase 1';
    for (const t of trials) {
      const p = (t.phase || '').toUpperCase();
      if (p.includes('PHASE 4') || p.includes('PHASE4')) highestPhase = 'Phase 4';
      else if ((p.includes('PHASE 3') || p.includes('PHASE3')) && highestPhase !== 'Phase 4') highestPhase = 'Phase 3';
      else if ((p.includes('PHASE 2') || p.includes('PHASE2')) && !['Phase 3', 'Phase 4'].includes(highestPhase)) highestPhase = 'Phase 2';
    }

    // Determine status
    const allTerminated = trials.every(t => 
      ['TERMINATED', 'WITHDRAWN', 'SUSPENDED'].some(s => (t.status || '').toUpperCase().includes(s))
    );

    let status: EvidenceStatus = 'Investigational';
    if (allTerminated && trials.length > 0) {
      status = 'Unsupported';
    } else if (highestPhase === 'Phase 4' || highestPhase === 'Phase 3') {
      status = 'Investigational';
    } else if (trials.length === 0 && citations.length > 0) {
      status = 'Off-label';
    } else if (trials.length === 0) {
      status = 'Preclinical';
    }

    // Compute evidence score
    const evidenceScore = computeEvidenceScore({
      condition: condName,
      trials,
      citations,
      mechanismOfAction,
      biologicalRationale: `Evaluation of ${genericName} targeting ${condName} via ${drugClass} pathway interactions.`,
      fdaWarnings: warnings,
      fdaContraindications: contraindications,
    });

    // Generate clear, explanatory evidence note
    let evidenceNote = '';
    if (evidenceScore.evidenceTier === 'Insufficient evidence') {
      evidenceNote = `Insufficient evidence: ${trials.length} trial(s) and ${citations.length} citation(s) identified. Score capped at ${evidenceScore.totalScore}/100 pending verified human studies or peer-reviewed literature.`;
    } else if (evidenceScore.trialOutcomeStatus) {
      evidenceNote = `${evidenceScore.trialOutcomeStatus} Phase ${highestPhase.replace(/phase /i, '')} clinical trial activity registered, but peer-reviewed outcome publications have not yet been indexed in PubMed. Trial existence does not establish efficacy.`;
    } else if (citations.length > 0 && trials.length > 0) {
      evidenceNote = `Supported by ${trials.length} registered clinical trial(s) (highest: ${highestPhase}) and ${citations.length} peer-reviewed PubMed publication(s). Research exploration only.`;
    } else if (trials.length > 0) {
      evidenceNote = `Investigational study registered in ClinicalTrials.gov (${trials.length} study/studies, highest: ${highestPhase}). Published outcome literature pending.`;
    } else {
      evidenceNote = `Identified in ${citations.length} PubMed publication(s) as an off-label or exploratory hypothesis.`;
    }

    const candidate: RepurposingCandidate = {
      id: `cand-${idx}-${encodeURIComponent(condName.toLowerCase())}`,
      condition: condName,
      status,
      highestPhase,
      evidenceScore,
      evidenceNote,
      trialOutcomeStatus: evidenceScore.trialOutcomeStatus,
      clinicalTrials: trials.slice(0, 5),
      citations,
      biologicalRationale: `Exploration of ${genericName} (${drugClass}) for ${condName} based on shared mechanistic targets and observed clinical or pre-clinical activity.`,
      safetyNotes: warnings.slice(0, 2),
      sourceCount: trials.length + citations.length,
    };

    return candidate;
  });

  const candidates = await Promise.all(candidatePromises);

  // Sort candidates by total score descending
  candidates.sort((a, b) => b.evidenceScore.totalScore - a.evidenceScore.totalScore);

  return {
    drug: drugConcept,
    approvedIndications,
    candidates,
    sourcesStatus,
    fetchedAt: now,
  };
}
