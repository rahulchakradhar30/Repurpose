import { PubMedCitation, ClinicalTrial, RepurposingCandidate } from '@/types';

/**
 * Generates an RIS (Research Information Systems) file string for citations.
 * RIS is the standard format importable by EndNote, Zotero, Mendeley, and RefWorks.
 */
export function exportToRIS(citations: PubMedCitation[], drugName: string, conditionName: string): string {
  if (!citations || citations.length === 0) {
    return [
      'TY  - GEN',
      `TI  - Repurposing Research Record: ${drugName} for ${conditionName}`,
      'JO  - Repurpose Open-Source Evidence Workspace',
      `PY  - ${new Date().getFullYear()}`,
      `N1  - No verified peer-reviewed publications indexed for this pair.`,
      'ER  - '
    ].join('\r\n');
  }

  const entries = citations.map(c => {
    const lines = [
      'TY  - JOUR',
      `TI  - ${c.title.replace(/\r?\n/g, ' ')}`,
      c.authors && c.authors.length > 0 ? c.authors.map(a => `AU  - ${a}`).join('\r\n') : 'AU  - [Authors not indexed]',
      c.journal ? `JO  - ${c.journal}` : null,
      c.pubDate ? `PY  - ${c.pubDate}` : null,
      c.doi ? `DO  - ${c.doi}` : null,
      c.pmid ? `UR  - https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/` : null,
      c.pmid ? `M3  - PMID: ${c.pmid}` : null,
      `N1  - Evidence evaluated in Repurpose Workspace for ${drugName} in ${conditionName}`,
      'ER  - '
    ].filter(Boolean);

    return lines.join('\r\n');
  });

  return entries.join('\r\n\r\n');
}

/**
 * Generates a clean CSV file string of published literature citations.
 */
export function exportCitationsToCSV(citations: PubMedCitation[], drugName: string, conditionName: string): string {
  const headers = ['PMID', 'Title', 'Journal', 'Publication Year', 'DOI', 'PubMed URL', 'Investigated Pair'];
  const rows = (citations || []).map(c => [
    `"${c.pmid || ''}"`,
    `"${(c.title || '').replace(/"/g, '""')}"`,
    `"${(c.journal || '').replace(/"/g, '""')}"`,
    `"${c.pubDate || ''}"`,
    `"${c.doi || ''}"`,
    `"https://pubmed.ncbi.nlm.nih.gov/${c.pmid || ''}/"`,
    `"${drugName} - ${conditionName}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Generates a research comparison CSV for up to 3 candidates.
 */
export function exportComparisonToCSV(candidates: { drug: string; candidate: RepurposingCandidate }[]): string {
  const headers = [
    'Drug Generic Name',
    'Candidate Condition',
    'Research State',
    'Research Readiness Score (0-100)',
    'Clinical Trial Maturity (0-25)',
    'Published Human Evidence (0-25)',
    'Mechanistic Plausibility (0-20)',
    'Source Quality & Recency (0-15)',
    'Safety & Context Compatibility (0-15)',
    'Conflict Penalties (pts)',
    'Registered Trials Count',
    'Highest Trial Phase',
    'PubMed Citations Count',
    'Identified Contradictions / Verification Flags',
    'Disclaimer'
  ];

  const rows = candidates.map(({ drug, candidate }) => {
    const b = candidate.readinessBreakdown;
    const contradictionsSummary = (candidate.contradictions || []).map(c => c.title).join('; ') || 'None flagged';

    return [
      `"${drug}"`,
      `"${candidate.condition}"`,
      `"${candidate.researchState || candidate.status}"`,
      `"${candidate.readinessScore ?? candidate.evidenceScore.totalScore}"`,
      `"${b?.clinicalTrialMaturity.score ?? 'N/A'}"`,
      `"${b?.publishedHumanEvidence.score ?? 'N/A'}"`,
      `"${b?.mechanisticPlausibility.score ?? 'N/A'}"`,
      `"${b?.sourceQualityRecency.score ?? 'N/A'}"`,
      `"${b?.safetyContextCompatibility.score ?? 'N/A'}"`,
      `"${b?.conflictPenalties.score ?? 0}"`,
      `"${candidate.clinicalTrials?.length || 0}"`,
      `"${candidate.highestPhase || 'N/A'}"`,
      `"${candidate.citations?.length || 0}"`,
      `"${contradictionsSummary.replace(/"/g, '""')}"`,
      `"For education and research use only. Not for medical diagnosis or clinical prescription."`
    ];
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Helper to trigger browser download of a text blob.
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string) {
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
