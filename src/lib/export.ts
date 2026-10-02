import { RepurposingCandidate, DrugConcept, PubMedCitation, ClinicalTrial } from '@/types';

/**
 * Generate standard RIS (Research Information Systems) format for academic reference managers (Zotero, EndNote, Mendeley).
 */
export function generateRIS(drug: DrugConcept, candidate: RepurposingCandidate): string {
  const lines: string[] = [];

  // 1. Export PubMed citations as journal articles
  candidate.citations.forEach((cit) => {
    lines.push('TY  - JOUR');
    lines.push(`TI  - ${cit.title}`);
    cit.authors.forEach((author) => {
      lines.push(`AU  - ${author}`);
    });
    lines.push(`JO  - ${cit.journal}`);
    lines.push(`PY  - ${cit.pubDate}`);
    if (cit.doi) {
      lines.push(`DO  - ${cit.doi}`);
    }
    lines.push(`UR  - ${cit.url}`);
    lines.push(`KW  - Drug Repurposing`);
    lines.push(`KW  - ${drug.genericName}`);
    lines.push(`KW  - ${candidate.condition}`);
    lines.push(`N1  - Repurpose App Evidence Score: ${candidate.evidenceScore.totalScore}/100`);
    lines.push('ER  - ');
    lines.push('');
  });

  // 2. Export Clinical Trials as clinical trial records / reports
  candidate.clinicalTrials.forEach((trial) => {
    lines.push('TY  - RPRT');
    lines.push(`TI  - Clinical Trial: ${trial.title}`);
    lines.push(`AU  - ${trial.leadSponsor}`);
    lines.push(`PY  - ${trial.completionDate ? trial.completionDate.slice(0, 4) : 'Ongoing'}`);
    lines.push(`UR  - ${trial.studyUrl}`);
    lines.push(`RN  - ${trial.nctId}`);
    lines.push(`KW  - Clinical Trial`);
    lines.push(`KW  - ${trial.phase}`);
    lines.push(`KW  - Status: ${trial.status}`);
    lines.push(`KW  - ${drug.genericName}`);
    lines.push(`KW  - ${candidate.condition}`);
    lines.push('ER  - ');
    lines.push('');
  });

  return lines.join('\r\n');
}

/**
 * Generate CSV export of candidate evidence, trials, and citations.
 */
export function generateCSV(drug: DrugConcept, candidates: RepurposingCandidate[]): string {
  const headers = [
    'Drug Generic Name',
    'RxCUI',
    'Drug Class',
    'Candidate Condition',
    'Evidence Status',
    'Total Evidence Score (100)',
    'Clinical Trial Score (40)',
    'Observational Score (20)',
    'Mechanistic Score (20)',
    'Reproducibility Score (10)',
    'Safety Score (10)',
    'Highest Trial Phase',
    'Total Registered Trials',
    'PubMed Citations Count',
    'Uncertainty Flags',
    'Primary Clinical Trial IDs',
    'Primary PubMed IDs',
  ];

  const escapeCSV = (str: string | number | undefined): string => {
    if (str === undefined || str === null) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = candidates.map((cand) => {
    const trialIds = cand.clinicalTrials.map((t) => t.nctId).join('; ');
    const pmids = cand.citations.map((c) => c.pmid).join('; ');
    const flags = cand.evidenceScore.uncertaintyFlags.join(' | ');

    return [
      escapeCSV(drug.genericName),
      escapeCSV(drug.rxNormId || 'N/A'),
      escapeCSV(drug.drugClass || 'N/A'),
      escapeCSV(cand.condition),
      escapeCSV(cand.status),
      escapeCSV(cand.evidenceScore.totalScore),
      escapeCSV(cand.evidenceScore.clinicalTrialScore),
      escapeCSV(cand.evidenceScore.humanObservationalScore),
      escapeCSV(cand.evidenceScore.mechanisticScore),
      escapeCSV(cand.evidenceScore.reproducibilityScore),
      escapeCSV(cand.evidenceScore.safetyCompatibilityScore),
      escapeCSV(cand.highestPhase),
      escapeCSV(cand.clinicalTrials.length),
      escapeCSV(cand.citations.length),
      escapeCSV(flags),
      escapeCSV(trialIds),
      escapeCSV(pmids),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
