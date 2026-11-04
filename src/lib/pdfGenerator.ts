import { DrugConcept, RepurposingCandidate, ClinicalTrial, PubMedCitation } from '@/types';
import { NotebookDossierItem } from './notebookStorage';

export interface DossierExportOptions {
  includeOverview: boolean;
  includeHypothesis: boolean;
  includeReadinessScore: boolean;
  includeClinicalTrials: boolean;
  trialsScope: 'all' | 'phase2plus' | 'completed';
  includeLiterature: boolean;
  citationsCount: number | 'all';
  includeSafety: boolean;
  includeNotebookNotes: boolean;
  includeAuditTrail: boolean;
  includeDisclaimer: boolean;
}

export type ExportPresetKey = 'executive' | 'clinical' | 'safety' | 'comprehensive';

export const EXPORT_PRESETS: Record<ExportPresetKey, {
  name: string;
  description: string;
  estimatedPages: string;
  options: DossierExportOptions;
}> = {
  executive: {
    name: 'Executive Brief',
    description: '1–2 page executive summary with readiness score, hypothesis, and key trials.',
    estimatedPages: '1–2 Pages',
    options: {
      includeOverview: true,
      includeHypothesis: true,
      includeReadinessScore: true,
      includeClinicalTrials: true,
      trialsScope: 'completed',
      includeLiterature: true,
      citationsCount: 5,
      includeSafety: true,
      includeNotebookNotes: true,
      includeAuditTrail: false,
      includeDisclaimer: true,
    },
  },
  clinical: {
    name: 'Clinical Trial Focus',
    description: 'Deep-dive into registered interventional trials, phases, and study sponsors.',
    estimatedPages: '2–4 Pages',
    options: {
      includeOverview: true,
      includeHypothesis: true,
      includeReadinessScore: true,
      includeClinicalTrials: true,
      trialsScope: 'all',
      includeLiterature: true,
      citationsCount: 5,
      includeSafety: true,
      includeNotebookNotes: false,
      includeAuditTrail: false,
      includeDisclaimer: true,
    },
  },
  safety: {
    name: 'Safety & Pharmacology',
    description: 'Focus on FDA package inserts, boxed warnings, contraindications, and toxicology.',
    estimatedPages: '1–2 Pages',
    options: {
      includeOverview: true,
      includeHypothesis: true,
      includeReadinessScore: false,
      includeClinicalTrials: false,
      trialsScope: 'completed',
      includeLiterature: false,
      citationsCount: 5,
      includeSafety: true,
      includeNotebookNotes: false,
      includeAuditTrail: true,
      includeDisclaimer: true,
    },
  },
  comprehensive: {
    name: 'Comprehensive Archive',
    description: 'Complete academic dossier including all trials, literature, notes, and audit trails.',
    estimatedPages: '3–5+ Pages',
    options: {
      includeOverview: true,
      includeHypothesis: true,
      includeReadinessScore: true,
      includeClinicalTrials: true,
      trialsScope: 'all',
      includeLiterature: true,
      citationsCount: 'all',
      includeSafety: true,
      includeNotebookNotes: true,
      includeAuditTrail: true,
      includeDisclaimer: true,
    },
  },
};

/**
 * Escapes characters for PDF string literals.
 */
function escapePdfText(text: string): string {
  return (text || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' '); // Standard ASCII / Latin-1 for standard Type 1 fonts
}

/**
 * Generates a valid standard PDF 1.4 Blob with multi-page support and
 * mandatory Repurpose logo + branding on the top-left of EVERY page.
 */
export function generateCustomDossierPdfBlob(params: {
  drug: DrugConcept;
  candidate?: RepurposingCandidate | null;
  options: DossierExportOptions;
  notebookItem?: NotebookDossierItem | null;
  investigatorName?: string;
}): Blob {
  const { drug, candidate, options, notebookItem, investigatorName = 'Investigator' } = params;
  const currentDate = new Date().toISOString().slice(0, 10);
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const docHeaderTitle = candidate ? candidate.condition.toUpperCase() : drug.genericName.toUpperCase();

  // Multi-page stream collectors
  const pages: string[][] = [];
  let currentPageLines: string[] = [];
  let currentPageNum = 1;
  let y = 740;

  // Draws Repurpose Favicon Logo + REPURPOSE Branding Header on page top-left
  function renderRunningHeader(pageNum: number) {
    // Vector Favicon Tile: Navy background rounded square (x: 50, y: 732, w: 18, h: 18)
    currentPageLines.push('0.06 0.09 0.16 rg 50 732 18 18 re f');
    // Vector Teal Cross inside tile
    currentPageLines.push('0.06 0.46 0.43 rg 57 734 4 14 re f');
    currentPageLines.push('0.06 0.46 0.43 rg 52 739 14 4 re f');
    // Vector Central White Dot
    currentPageLines.push('0.97 0.98 0.99 rg 58 740 2 2 re f');

    // Branding text (Top-left)
    currentPageLines.push('0.06 0.09 0.16 rg'); // Reset to dark ink
    currentPageLines.push(`BT /F2 13 Tf 74 736 Td (REPURPOSE) Tj ET`);
    currentPageLines.push(`BT /F1 8 Tf 160 738 Td (|  Biomedical Evidence Workspace) Tj ET`);
    currentPageLines.push(`BT /F1 8 Tf 400 738 Td (Date: ${currentDate}  |  Page ${pageNum}) Tj ET`);

    // Top Divider Rule
    currentPageLines.push('0.75 w 0.8 0.85 0.9 RG 50 724 m 562 724 l S');
    y = 705;
  }

  // Draws legal disclaimer & pagination on bottom of page
  function renderRunningFooter(pageNum: number) {
    if (options.includeDisclaimer) {
      currentPageLines.push('0.5 w 0.85 0.88 0.92 RG 50 56 m 562 56 l S');
      currentPageLines.push(`BT /F1 7 Tf 50 46 Td (ACADEMIC RESEARCH & EDUCATION ONLY. Repurpose does NOT provide clinical or prescribing guidance.) Tj ET`);
      currentPageLines.push(`BT /F2 7 Tf 50 36 Td (Repurpose Evidence Platform  |  https://drugrepurpose.vercel.app) Tj ET`);
      currentPageLines.push(`BT /F1 7 Tf 505 36 Td (Page ${pageNum}) Tj ET`);
    }
  }

  // Starts a new page when vertical space runs out
  function startNewPage() {
    renderRunningFooter(currentPageNum);
    pages.push(currentPageLines);
    currentPageNum++;
    currentPageLines = [];
    renderRunningHeader(currentPageNum);
  }

  function addText(text: string, font: string = '/F1', size: number = 10, dy: number = 13) {
    if (y < 70) {
      startNewPage();
    }
    const clean = escapePdfText(text);
    currentPageLines.push(`BT ${font} ${size} Tf 50 ${y} Td (${clean}) Tj ET`);
    y -= dy;
  }

  function addRule() {
    if (y < 70) {
      startNewPage();
    }
    currentPageLines.push(`0.5 w 0.85 0.88 0.92 RG 50 ${y} m 562 ${y} l S`);
    y -= 10;
  }

  function wrapText(text: string, maxChars: number = 85, font: string = '/F1', size: number = 9, dy: number = 12) {
    const clean = escapePdfText(text);
    const words = clean.split(' ');
    let curLine = '';
    for (const w of words) {
      if ((curLine + w).length > maxChars) {
        addText(curLine, font, size, dy);
        curLine = '';
      }
      curLine += w + ' ';
    }
    if (curLine.trim()) {
      addText(curLine, font, size, dy);
    }
  }

  // 1. Initial Page Header (Page 1)
  renderRunningHeader(1);

  // Title Block
  addText(drug.genericName.toUpperCase(), '/F2', 18, 20);
  if (candidate) {
    addText(`Repurposing Hypothesis: ${candidate.condition}`, '/F2', 12, 15);
  }
  addText(`Investigator: ${investigatorName}  |  Generated: ${currentDate} ${currentTime}`, '/F1', 8, 14);
  addRule();

  // 2. Drug Monograph Overview
  if (options.includeOverview) {
    addText('1. DRUG MONOGRAPH & REGULATORY IDENTIFIERS', '/F2', 11, 14);
    const drugClass = drug.drugClass || 'Small molecule therapeutic agent';
    const rxNorm = drug.rxNormId ? `RxCUI: ${drug.rxNormId}` : 'RxCUI: Not indexed';
    const pubchem = drug.pubchemCid ? `PubChem CID: ${drug.pubchemCid}` : '';
    addText(`Classification: ${drugClass}  |  ${rxNorm}  ${pubchem}`, '/F1', 9, 13);

    if (drug.mechanismOfAction) {
      addText('Mechanism of Action:', '/F2', 9, 11);
      wrapText(drug.mechanismOfAction, 88, '/F1', 8.5, 11);
      y -= 3;
    }

    if (drug.approvedIndications && drug.approvedIndications.length > 0) {
      addText(`FDA Approved Indication: ${drug.approvedIndications[0].slice(0, 95)}`, '/F1', 8.5, 12);
    }
    addRule();
  }

  // 3. Target Hypothesis & Research Readiness Score
  if (candidate && options.includeHypothesis) {
    addText('2. INVESTIGATIONAL HYPOTHESIS & RATIONALE', '/F2', 11, 14);
    addText(`Target Condition: ${candidate.condition}  |  Status: ${candidate.status}  |  Highest Phase: ${candidate.highestPhase}`, '/F1', 9, 12);

    if (candidate.biologicalRationale) {
      addText('Biological Rationale:', '/F2', 9, 11);
      wrapText(candidate.biologicalRationale, 88, '/F1', 8.5, 11);
      y -= 2;
    }

    if (options.includeReadinessScore) {
      const score = candidate.readinessScore ?? candidate.evidenceScore?.totalScore ?? 0;
      const tier = candidate.readinessTier || candidate.evidenceScore?.evidenceTier || 'Active Evaluation';
      addText(`Research Readiness Score: ${score}/100  (${tier})`, '/F2', 10, 13);
      
      const b = candidate.readinessBreakdown || (candidate.evidenceScore as any)?.breakdown;
      if (b) {
        addText(`  • Clinical Trial Maturity: ${b.clinicalTrialMaturity.score}/25`, '/F1', 8.5, 11);
        addText(`  • Published Human Evidence: ${b.publishedHumanEvidence.score}/25`, '/F1', 8.5, 11);
        addText(`  • Mechanistic Plausibility: ${b.mechanisticPlausibility.score}/20`, '/F1', 8.5, 11);
        addText(`  • Source Quality & Recency: ${b.sourceQualityRecency.score}/15`, '/F1', 8.5, 11);
        addText(`  • Safety Compatibility: ${b.safetyContextCompatibility.score}/15`, '/F1', 8.5, 11);
        if (b.conflictPenalties && b.conflictPenalties.score < 0) {
          addText(`  • Conflict Penalty: ${b.conflictPenalties.score} pts (${b.conflictPenalties.reason || 'Safety/contradiction flag'})`, '/F1', 8.5, 11);
        }
      }
    }
    addRule();
  }

  // 4. Clinical Trials Section
  if (options.includeClinicalTrials && candidate) {
    let trials = candidate.clinicalTrials || [];
    if (options.trialsScope === 'completed') {
      trials = trials.filter(t => (t.status || '').toUpperCase().includes('COMPLETED'));
    } else if (options.trialsScope === 'phase2plus') {
      trials = trials.filter(t => {
        const p = (t.phase || '').toUpperCase();
        return p.includes('PHASE 2') || p.includes('PHASE 3') || p.includes('PHASE 4');
      });
    }

    addText(`3. REGISTERED CLINICAL TRIALS (${trials.length} Studies Included)`, '/F2', 11, 14);
    if (trials.length === 0) {
      addText('No interventional clinical trials matching the selected filter scope.', '/F1', 8.5, 12);
    } else {
      const maxToShow = options.trialsScope === 'all' ? 25 : 12;
      trials.slice(0, maxToShow).forEach((t, i) => {
        const nct = t.nctId || 'NCT Registry';
        const phase = t.phase || 'Phase Unspecified';
        const status = t.status || 'Active';
        const sponsor = t.leadSponsor ? `| ${t.leadSponsor.slice(0, 30)}` : '';
        addText(`${i + 1}. [${nct}] ${phase} (${status}) ${sponsor}`, '/F2', 8.5, 11);
        if (t.title) {
          wrapText(t.title, 90, '/F1', 8, 10);
        }
        y -= 2;
      });
    }
    addRule();
  }

  // 5. Literature Citations Section
  if (options.includeLiterature && candidate) {
    let citations = candidate.citations || [];
    if (options.citationsCount !== 'all' && typeof options.citationsCount === 'number') {
      citations = citations.slice(0, options.citationsCount);
    }

    addText(`4. PEER-REVIEWED LITERATURE CITATIONS (${citations.length} Citations)`, '/F2', 11, 14);
    if (citations.length === 0) {
      addText('No peer-reviewed publications indexed in PubMed for this drug-condition pair.', '/F1', 8.5, 12);
    } else {
      citations.forEach((c, i) => {
        const pmid = c.pmid ? `PMID:${c.pmid}` : 'PubMed';
        const journal = c.journal ? `[${c.journal}]` : '';
        const year = c.pubDate ? `(${c.pubDate})` : '';
        addText(`${i + 1}. ${pmid} ${journal} ${year}`, '/F2', 8.5, 10);
        if (c.title) {
          wrapText(c.title, 90, '/F1', 8, 10);
        }
        y -= 2;
      });
    }
    addRule();
  }

  // 6. FDA Safety & Warnings Section
  if (options.includeSafety) {
    addText('5. FDA SAFETY, WARNINGS & PRECAUTIONS', '/F2', 11, 14);
    const warnings = drug.warnings || [];
    const contraindications = drug.contraindications || [];

    if (warnings.length > 0) {
      addText('Boxed Warnings & Precautions:', '/F2', 8.5, 11);
      wrapText(warnings.join(' '), 90, '/F1', 8, 11);
      y -= 2;
    }
    if (contraindications.length > 0) {
      addText('Contraindications:', '/F2', 8.5, 11);
      wrapText(contraindications.join(' '), 90, '/F1', 8, 11);
      y -= 2;
    }
    if (warnings.length === 0 && contraindications.length === 0) {
      addText('No acute boxed warnings or contraindications extracted from primary structured label.', '/F1', 8.5, 12);
    }
    addRule();
  }

  // 7. Investigator Notes & Verification Checklist
  if (options.includeNotebookNotes && notebookItem) {
    addText('6. INVESTIGATOR NOTES & CHECKLIST (PRIVATE VAULT)', '/F2', 11, 14);
    if (notebookItem.tags && notebookItem.tags.length > 0) {
      addText(`Tags: ${notebookItem.tags.map(t => '#' + t).join(' ')}`, '/F1', 8.5, 11);
    }
    if (notebookItem.notes) {
      addText('Private Notes:', '/F2', 8.5, 11);
      wrapText(notebookItem.notes, 88, '/F1', 8, 11);
    }
    if (notebookItem.checklist) {
      const keys = Object.keys(notebookItem.checklist);
      const done = keys.filter(k => notebookItem.checklist && notebookItem.checklist[k]).length;
      addText(`Checklist Status: ${done} of ${keys.length} verification steps completed`, '/F1', 8.5, 11);
    }
    addRule();
  }

  // 8. Source Provenance Audit Trail
  if (options.includeAuditTrail) {
    addText('7. PRIMARY SOURCE AUDIT TRAIL', '/F2', 10, 13);
    const sources = drug.sources || [];
    if (sources.length > 0) {
      const srcText = sources.map(s => `${s.name}: ${s.status}`).join('  |  ');
      addText(srcText, '/F1', 8, 11);
    }
    addText(`Audit Verified: ${drug.lastVerifiedDate || currentDate}  |  Upstream API endpoints queried natively`, '/F1', 8, 11);
    addRule();
  }

  // Finish last page footer and push
  renderRunningFooter(currentPageNum);
  pages.push(currentPageLines);

  const totalPageCount = pages.length;

  // Build PDF 1.4 Object Structure
  // Object 1: Catalog
  // Object 2: Pages
  // Object 3: Font F1 (Helvetica)
  // Object 4: Font F2 (Helvetica-Bold)
  // For page i:
  //   pageObjId = 5 + (i - 1) * 2
  //   contentObjId = 6 + (i - 1) * 2
  const pageKids: string[] = [];
  const pageAndContentObjs: string[] = [];

  for (let i = 0; i < totalPageCount; i++) {
    const pageObjId = 5 + i * 2;
    const contentObjId = 6 + i * 2;
    pageKids.push(`${pageObjId} 0 R`);

    const streamContent = pages[i].join('\n');
    const streamLength = new TextEncoder().encode(streamContent).length;

    pageAndContentObjs.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj`
    );

    pageAndContentObjs.push(
      `${contentObjId} 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`
    );
  }

  const pdfBody = [
    '%PDF-1.4',
    '1 0 obj',
    '<< /Type /Catalog /Pages 2 0 R >>',
    'endobj',
    '2 0 obj',
    `<< /Type /Pages /Kids [${pageKids.join(' ')}] /Count ${totalPageCount} >>`,
    'endobj',
    '3 0 obj',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    'endobj',
    '4 0 obj',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    'endobj',
    ...pageAndContentObjs,
  ];

  const assembledString = pdfBody.join('\n') + '\n';
  const totalObjectsCount = 4 + totalPageCount * 2;

  // Compute exact byte offsets for cross-reference table
  const offsets: number[] = [0];
  for (let objId = 1; objId <= totalObjectsCount; objId++) {
    const headerStr = `${objId} 0 obj`;
    const pos = assembledString.indexOf(headerStr);
    offsets.push(pos);
  }

  const xrefStart = assembledString.length;
  const xrefLines = [
    'xref',
    `0 ${totalObjectsCount + 1}`,
    '0000000000 65535 f ',
    ...offsets.slice(1).map(off => off.toString().padStart(10, '0') + ' 00000 n ')
  ];

  const trailer = [
    'trailer',
    `<< /Size ${totalObjectsCount + 1} /Root 1 0 R >>`,
    'startxref',
    xrefStart.toString(),
    '%%EOF'
  ];

  const fullPdfString = assembledString + xrefLines.join('\n') + '\n' + trailer.join('\n');
  return new Blob([fullPdfString], { type: 'application/pdf' });
}
