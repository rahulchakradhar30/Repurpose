import { describe, it, expect } from 'vitest';
import {
  generateCustomDossierPdfBlob,
  EXPORT_PRESETS,
  DossierExportOptions,
} from '@/lib/pdfGenerator';
import { DrugConcept, RepurposingCandidate } from '@/types';

describe('Customizable Dossier PDF Generation Engine', () => {
  const mockDrug: DrugConcept = {
    genericName: 'Losartan Potassium',
    brandNames: ['Cozaar'],
    drugClass: 'Angiotensin II Receptor Blocker (ARB)',
    rxNormId: '5224',
    pubchemCid: '3961',
    mechanismOfAction: 'Selectively blocks the binding of angiotensin II to AT1 receptors in vascular smooth muscle.',
    approvedIndications: ['INDICATIONS AND USAGE: Hypertension, Diabetic Nephropathy in patients with type 2 diabetes.'],
    warnings: ['Black Box Warning: Fetal Toxicity. Discontinue as soon as pregnancy is detected.'],
    contraindications: ['Do not co-administer with aliskiren in patients with diabetes.'],
    lastVerifiedDate: '2026-11-04',
    sources: [
      { name: 'openFDA', status: 'ok', url: 'https://dailymed.nlm.nih.gov', timestamp: '2026-11-04T12:00:00Z' },
      { name: 'RxNorm', status: 'ok', url: 'https://mor.nlm.nih.gov/RxNav', timestamp: '2026-11-04T12:00:00Z' },
    ],
  };

  const mockCandidate: RepurposingCandidate = {
    id: 'losartan__minimal_change',
    condition: 'Minimal Change Disease',
    status: 'Investigational',
    highestPhase: 'Phase 2',
    sourceCount: 3,
    biologicalRationale: 'Podocyte protection via inhibition of AT1 receptor mediated cytoskeletal rearrangement.',
    safetyNotes: ['Monitor serum potassium and renal function in nephrotic syndrome.'],
    readinessScore: 74,
    readinessTier: 'Moderate',
    evidenceScore: {
      clinicalTrialScore: 22,
      humanObservationalScore: 18,
      mechanisticScore: 16,
      reproducibilityScore: 9,
      safetyCompatibilityScore: 9,
      totalScore: 74,
      evidenceTier: 'Moderate',
      contributingFactors: ['Phase 2 trial registered', 'High podocyte biological rationale'],
      uncertaintyFlags: ['Sample size boundaries'],
      breakdown: {
        clinicalTrialMaturity: { score: 22, max: 25, reason: 'Phase 2 interventional' },
        publishedHumanEvidence: { score: 18, max: 25, reason: 'Controlled studies' },
        mechanisticPlausibility: { score: 16, max: 20, reason: 'Direct AT1 target' },
        sourceQualityRecency: { score: 9, max: 15, reason: 'Recent publication' },
        safetyContextCompatibility: { score: 9, max: 15, reason: 'Known profile' },
        conflictPenalties: { score: 0, reason: 'None' },
      },
    },
    clinicalTrials: [
      {
        nctId: 'NCT01234567',
        title: 'Losartan for Steroid-Resistant Minimal Change Disease in Adults',
        phase: 'Phase 2',
        status: 'Completed',
        conditions: ['Minimal Change Disease'],
        studyUrl: 'https://clinicaltrials.gov/study/NCT01234567',
        leadSponsor: 'National Institute of Diabetes and Digestive and Kidney Diseases',
      },
    ],
    citations: [
      {
        pmid: '42763496',
        title: 'Angiotensin receptor blockade attenuates proteinuria and preserves podocyte foot processes.',
        journal: 'J Am Soc Nephrol',
        pubDate: '2025-08-14',
        authors: ['Smith J', 'Doe A'],
        url: 'https://pubmed.ncbi.nlm.nih.gov/42763496',
      },
    ],
  };

  it('generates a valid PDF 1.4 blob with Repurpose branding at top-left', async () => {
    const blob = generateCustomDossierPdfBlob({
      drug: mockDrug,
      candidate: mockCandidate,
      options: EXPORT_PRESETS.executive.options,
      investigatorName: 'Dr. Jane Doe',
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');

    const text = await blob.text();
    expect(text).toContain('%PDF-1.4');
    expect(text).toContain('REPURPOSE');
    expect(text).toContain('|  Biomedical Evidence Workspace');
    // Verifies the vector favicon motif (navy tile, teal cross, white dot)
    expect(text).toContain('0.06 0.09 0.16 rg 50 732 18 18 re f');
    expect(text).toContain('0.06 0.46 0.43 rg 57 734 4 14 re f');
    expect(text).toContain('LOSARTAN POTASSIUM');
    expect(text).toContain('Repurposing Hypothesis: Minimal Change Disease');
    expect(text).toContain('Dr. Jane Doe');
    expect(text).toContain('Research Readiness Score: 74/100');
    expect(text).toContain('trailer');
    expect(text).toContain('%%EOF');
  });

  it('renders Repurpose logo and branding on EVERY page for multi-page dossiers', async () => {
    // Generate lots of trials to force multi-page generation
    const manyTrials = Array.from({ length: 25 }, (_, i) => ({
      nctId: `NCT000000${i + 10}`,
      title: `Interventional Trial ${i + 1} Evaluating Long-Term Podocyte Recovery and Efficacy`,
      phase: 'Phase 2',
      status: 'Completed',
      conditions: ['Minimal Change Disease'],
      studyUrl: `https://clinicaltrials.gov/study/NCT000000${i + 10}`,
      leadSponsor: `Biomedical Consortium ${i + 1}`,
    }));

    const manyCitations = Array.from({ length: 20 }, (_, i) => ({
      pmid: `${40000000 + i}`,
      title: `Peer-Reviewed Article ${i + 1} on Pharmacological Repositioning and Biological Pathways`,
      journal: 'Nature Medicine',
      pubDate: '2025-01-10',
      authors: [`Author ${i}`],
      url: `https://pubmed.ncbi.nlm.nih.gov/${40000000 + i}`,
    }));

    const comprehensiveCandidate: RepurposingCandidate = {
      ...mockCandidate,
      clinicalTrials: manyTrials,
      citations: manyCitations,
    };

    const blob = generateCustomDossierPdfBlob({
      drug: mockDrug,
      candidate: comprehensiveCandidate,
      options: EXPORT_PRESETS.comprehensive.options,
      investigatorName: 'Dr. Multi-Page',
    });

    const text = await blob.text();
    // Check that there is more than 1 page
    const pageMatch = text.match(/\/Count (\d+)/);
    expect(pageMatch).not.toBeNull();
    const pageCount = parseInt(pageMatch![1], 10);
    expect(pageCount).toBeGreaterThan(1);

    // Verify that the Repurpose vector logo appears on EVERY page
    const logoTileMatches = text.match(/0\.06 0\.09 0\.16 rg 50 732 18 18 re f/g);
    expect(logoTileMatches).not.toBeNull();
    expect(logoTileMatches!.length).toBe(pageCount);

    // Verify that REPURPOSE branding appears on every page
    const repurposeBrandingMatches = text.match(/\(REPURPOSE\) Tj/g);
    expect(repurposeBrandingMatches).not.toBeNull();
    expect(repurposeBrandingMatches!.length).toBe(pageCount);

    // Verify page indicators
    for (let p = 1; p <= pageCount; p++) {
      expect(text).toContain(`Page ${p}`);
    }
  });

  it('respects all export presets (executive, clinical, safety, comprehensive)', async () => {
    const presets = Object.keys(EXPORT_PRESETS) as (keyof typeof EXPORT_PRESETS)[];
    for (const key of presets) {
      const preset = EXPORT_PRESETS[key];
      const blob = generateCustomDossierPdfBlob({
        drug: mockDrug,
        candidate: mockCandidate,
        options: preset.options,
      });
      const text = await blob.text();
      expect(text).toContain('%PDF-1.4');
      expect(text).toContain('REPURPOSE');
      expect(text).toContain('%%EOF');
    }
  });

  it('handles drug-only dossiers without candidate hypothesis gracefully', async () => {
    const blob = generateCustomDossierPdfBlob({
      drug: mockDrug,
      candidate: null,
      options: EXPORT_PRESETS.safety.options,
    });
    const text = await blob.text();
    expect(text).toContain('%PDF-1.4');
    expect(text).toContain('LOSARTAN POTASSIUM');
    expect(text).toContain('FDA SAFETY, WARNINGS & PRECAUTIONS');
  });
});
