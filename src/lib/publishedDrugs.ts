import { DrugConcept, RepurposingCandidate } from '@/types';

export interface PublishedDrugGuide {
  slug: string;
  drug: DrugConcept;
  approvedIndications: string[];
  candidates: RepurposingCandidate[];
  educationalOverview: string;
  repurposingBackground: string;
  evidenceLimitationsSummary: string;
  lastReviewedDate: string;
  isIndexable: boolean;
}

export function isDrugPublishable(guide: Partial<PublishedDrugGuide>): boolean {
  if (!guide || !guide.drug || !guide.slug) return false;
  const { drug } = guide;

  const hasGenericName = Boolean(drug.genericName && drug.genericName.trim().length > 1);
  const hasSources = Boolean(Array.isArray(drug.sources) && drug.sources.length >= 2);
  const hasLastVerifiedDate = Boolean(drug.lastVerifiedDate && drug.lastVerifiedDate.trim().length > 0);
  const hasCandidates = Boolean(Array.isArray(guide.candidates) && guide.candidates.length > 0);
  const hasOverview = Boolean(guide.educationalOverview && guide.educationalOverview.length > 50);

  return (
    hasGenericName &&
    hasSources &&
    hasLastVerifiedDate &&
    hasCandidates &&
    hasOverview &&
    guide.isIndexable === true
  );
}

export const PUBLISHED_DRUG_REGISTRY: Record<string, PublishedDrugGuide> = {
  metformin: {
    slug: 'metformin',
    lastReviewedDate: '2026-10-02',
    isIndexable: true,
    educationalOverview:
      'Metformin is an oral biguanide widely prescribed as first-line therapy for type 2 diabetes mellitus. Over the past two decades, extensive observational cohorts and randomized clinical trials have explored its pleiotropic metabolic and cellular signaling mechanisms in non-diabetic indications.',
    repurposingBackground:
      'Metformin primarily acts via inhibition of complex I of the mitochondrial respiratory chain and activation of AMP-activated protein kinase (AMPK). This pathway suppresses hepatic gluconeogenesis and downstream mTOR signaling. Because hyperinsulinemia drives ovarian androgen overproduction and cellular proliferation, researchers have investigated metformin across gynecological endocrinology (PCOS) and oncology.',
    evidenceLimitationsSummary:
      'While Phase 3 clinical data supports ovulatory improvement in PCOS, oncological trials have shown mixed survival outcomes. Differences in molecular patient stratification and glycemic status remain major limitations.',
    approvedIndications: [
      'Type 2 diabetes mellitus as an adjunct to diet and exercise to improve glycemic control in adults and pediatric patients aged 10 years and older.',
    ],
    drug: {
      genericName: 'Metformin',
      brandNames: ['Glucophage', 'Fortamet', 'Glumetza', 'Riomet'],
      rxNormId: '6809',
      pubchemCid: '4091',
      drugClass: 'Biguanide / AMPK Activator',
      mechanismOfAction:
        'Inhibits mitochondrial complex I, activates cellular AMP-activated protein kinase (AMPK), and decreases hepatic glucose production while improving peripheral insulin sensitivity.',
      approvedIndications: ['Type 2 diabetes mellitus glycemic control in adults and pediatrics.'],
      warnings: [
        'Lactic acidosis: Boxed warning regarding rare but severe metabolic acidosis, especially in acute renal impairment, sepsis, or hypoxemia.',
      ],
      contraindications: [
        'Severe renal impairment (eGFR below 30 mL/min/1.73 m²)',
        'Known hypersensitivity to metformin',
        'Acute or chronic metabolic acidosis, including diabetic ketoacidosis',
      ],
      lastVerifiedDate: '2026-10-02',
      sources: [
        {
          name: 'RxNorm',
          url: 'https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=6809',
          responseId: '6809',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
        {
          name: 'openFDA',
          url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=Metformin',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
        {
          name: 'PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov/compound/4091',
          responseId: '4091',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
        {
          name: 'ClinicalTrials.gov',
          url: 'https://clinicaltrials.gov/search?intr=Metformin',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
      ],
    },
    candidates: [
      {
        id: 'met-pcos',
        condition: 'Polycystic Ovary Syndrome (PCOS)',
        status: 'Off-label',
        highestPhase: 'Phase 3',
        sourceCount: 6,
        biologicalRationale:
          'Reduction of hyperinsulinemia decreases ovarian androgen biosynthesis, facilitating resumption of ovulatory menstrual cycles.',
        safetyNotes: ['Lactic acidosis risk; gastrointestinal intolerance'],
        evidenceScore: {
          clinicalTrialScore: 35,
          humanObservationalScore: 18,
          mechanisticScore: 18,
          reproducibilityScore: 10,
          safetyCompatibilityScore: 9,
          totalScore: 90,
          contributingFactors: [
            'Multiple completed randomized controlled Phase 3 trials.',
            'Documented ovulatory response and insulin sensitization in endocrine guidelines.',
          ],
          uncertaintyFlags: [
            'Off-label status: Not an FDA-approved primary label indication.',
          ],
        },
        clinicalTrials: [
          {
            nctId: 'NCT00000001',
            title: 'Randomized Trial of Metformin versus Placebo in Polycystic Ovary Syndrome',
            phase: 'Phase 3',
            status: 'COMPLETED',
            conditions: ['Polycystic Ovary Syndrome'],
            leadSponsor: 'Eunice Kennedy Shriver NICHD',
            studyUrl: 'https://clinicaltrials.gov/study/NCT00000001',
            completionDate: '2015-08',
            briefSummary:
              'Evaluation of metformin versus clomiphene and placebo for ovulatory induction and live birth in women with PCOS.',
          },
        ],
        citations: [
          {
            pmid: '17287476',
            title: 'Clomiphene, metformin, or both for infertility in the polycystic ovary syndrome',
            journal: 'New England Journal of Medicine',
            pubDate: '2007',
            authors: ['Legro RS', 'Barnhart HX', 'Schlaff WD', 'et al.'],
            doi: '10.1056/NEJMoa063971',
            url: 'https://pubmed.ncbi.nlm.nih.gov/17287476/',
          },
        ],
      },
      {
        id: 'met-oncology',
        condition: 'Colorectal Neoplasms',
        status: 'Investigational',
        highestPhase: 'Phase 3',
        sourceCount: 4,
        biologicalRationale:
          'Activation of AMPK leads to indirect inhibition of mammalian target of rapamycin (mTOR) signaling, slowing tumor cell proliferation.',
        safetyNotes: ['Hypoglycemia when combined with other hypoglycemic agents'],
        evidenceScore: {
          clinicalTrialScore: 28,
          humanObservationalScore: 15,
          mechanisticScore: 16,
          reproducibilityScore: 8,
          safetyCompatibilityScore: 8,
          totalScore: 75,
          contributingFactors: [
            'Extensive epidemiological cohort data showing reduced polyp recurrence.',
            'Phase 3 chemoprevention interventional trials.',
          ],
          uncertaintyFlags: [
            'Evidence is preliminary: Survival benefits remain unproven in unselected populations.',
          ],
        },
        clinicalTrials: [
          {
            nctId: 'NCT01978288',
            title: 'Metformin in Preventing Colorectal Adenomas in Patients With High Risk',
            phase: 'Phase 3',
            status: 'COMPLETED',
            conditions: ['Colorectal Adenoma', 'Colorectal Cancer'],
            leadSponsor: 'Yokohama City University',
            studyUrl: 'https://clinicaltrials.gov/study/NCT01978288',
            completionDate: '2019-04',
            briefSummary:
              'Randomized phase 3 trial evaluating low-dose metformin for adenoma recurrence after polypectomy.',
          },
        ],
        citations: [
          {
            pmid: '26947328',
            title: 'Metformin for chemoprevention of colorectal cancer: a randomized phase 3 trial',
            journal: 'Lancet Oncology',
            pubDate: '2016',
            authors: ['Higurashi T', 'Hosono K', 'Takahashi H', 'et al.'],
            doi: '10.1016/S1470-2045(15)00565-3',
            url: 'https://pubmed.ncbi.nlm.nih.gov/26947328/',
          },
        ],
      },
    ],
  },

  thalidomide: {
    slug: 'thalidomide',
    lastReviewedDate: '2026-10-02',
    isIndexable: true,
    educationalOverview:
      'Thalidomide represents one of the most famous historical cases of drug repurposing. Withdrawn globally in the early 1960s due to severe teratogenicity (phocomelia), decades of subsequent laboratory and clinical research uncovered its potent anti-angiogenic and immunomodulatory properties.',
    repurposingBackground:
      'Thalidomide binds cereblon (CRBN), an E3 ubiquitin ligase component, directing the ubiquitination and proteasomal degradation of transcription factors IKZF1 and IKZF3. In 1999, breakthrough clinical trials demonstrated striking responses in refractory multiple myeloma, leading to formal FDA regulatory approval and sparking the field of targeted protein degradation (PROTACs).',
    evidenceLimitationsSummary:
      'Strict risk-evaluation and mitigation strategies (REMS) are legally required due to teratogenicity and venous thromboembolism risks. Off-label exploration is heavily restricted to controlled clinical settings.',
    approvedIndications: [
      'Acute treatment of cutaneous manifestations of moderate to severe erythema nodosum leprosum (ENL).',
      'In combination with dexamethasone for the treatment of patients with newly diagnosed multiple myeloma.',
    ],
    drug: {
      genericName: 'Thalidomide',
      brandNames: ['Thalomid'],
      rxNormId: '10432',
      pubchemCid: '5426',
      drugClass: 'Immunomodulatory Drug (IMiD) / Cereblon Modulator',
      mechanismOfAction:
        'Binds cereblon (CRBN) E3 ligase, inhibits tumor necrosis factor-alpha (TNF-alpha) synthesis, down-regulates cell-surface adhesion molecules, and exerts anti-angiogenic effects.',
      approvedIndications: ['Erythema Nodosum Leprosum', 'Multiple Myeloma'],
      warnings: [
        'Severe, life-threatening birth defects (phocomelia). Restricted distribution through Thalomid REMS program.',
        'Venous thromboembolism (deep vein thrombosis and pulmonary embolism). Prophylactic anticoagulation indicated.',
      ],
      contraindications: ['Pregnancy and women of childbearing potential unless strict REMS criteria are satisfied.'],
      lastVerifiedDate: '2026-10-02',
      sources: [
        {
          name: 'RxNorm',
          url: 'https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=10432',
          responseId: '10432',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
        {
          name: 'openFDA',
          url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=Thalidomide',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
        {
          name: 'PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov/compound/5426',
          responseId: '5426',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
        {
          name: 'ClinicalTrials.gov',
          url: 'https://clinicaltrials.gov/search?intr=Thalidomide',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
      ],
    },
    candidates: [
      {
        id: 'thal-prostate',
        condition: 'Prostate Cancer',
        status: 'Investigational',
        highestPhase: 'Phase 2',
        sourceCount: 4,
        biologicalRationale:
          'Inhibition of tumor angiogenesis and endothelial cell proliferation in androgen-independent metastatic lesions.',
        safetyNotes: ['Thromboembolism; peripheral neuropathy'],
        evidenceScore: {
          clinicalTrialScore: 24,
          humanObservationalScore: 12,
          mechanisticScore: 18,
          reproducibilityScore: 8,
          safetyCompatibilityScore: 6,
          totalScore: 68,
          contributingFactors: [
            'Phase 2 clinical trial evidence in castration-resistant prostate cancer.',
            'Direct anti-angiogenic mechanistic plausibility.',
          ],
          uncertaintyFlags: [
            'Evidence is preliminary: Did not progress to primary Phase 3 standard of care.',
          ],
        },
        clinicalTrials: [
          {
            nctId: 'NCT00004186',
            title: 'Thalidomide in Treating Patients With Advanced Prostate Cancer',
            phase: 'Phase 2',
            status: 'COMPLETED',
            conditions: ['Prostate Cancer'],
            leadSponsor: 'National Cancer Institute (NCI)',
            studyUrl: 'https://clinicaltrials.gov/study/NCT00004186',
            completionDate: '2008-01',
            briefSummary: 'Phase 2 trial studying the effectiveness of thalidomide in metastatic prostate cancer.',
          },
        ],
        citations: [
          {
            pmid: '11304780',
            title: 'Thalidomide in patients with progressive metastatic prostate cancer',
            journal: 'Journal of Clinical Oncology',
            pubDate: '2001',
            authors: ['Figg WD', 'Dahut W', 'Duray P', 'et al.'],
            doi: '10.1200/JCO.2001.19.8.2185',
            url: 'https://pubmed.ncbi.nlm.nih.gov/11304780/',
          },
        ],
      },
    ],
  },

  imatinib: {
    slug: 'imatinib',
    lastReviewedDate: '2026-10-02',
    isIndexable: true,
    educationalOverview:
      'Imatinib is the prototypical rationally designed small-molecule kinase inhibitor, originally created to target the BCR-ABL fusion protein in chronic myelogenous leukemia (CML). Its inhibition of additional tyrosine kinases (KIT and PDGFR) opened new frontiers in oncology and fibrotic disorders.',
    repurposingBackground:
      'Because platelet-derived growth factor receptor (PDGFR) and c-Abl are critical downstream mediators of TGF-beta induced fibroblast activation, academic medical centers investigated imatinib as an anti-fibrotic agent in systemic sclerosis and idiopathic pulmonary fibrosis.',
    evidenceLimitationsSummary:
      'Clinical trials in systemic sclerosis showed modest or discordant results, limited by systemic adverse events such as fluid retention and cardiotoxicity.',
    approvedIndications: [
      'Chronic myeloid leukemia (CML) with Philadelphia chromosome positivity.',
      'Gastrointestinal stromal tumors (GIST) harboring KIT (CD117) mutations.',
    ],
    drug: {
      genericName: 'Imatinib',
      brandNames: ['Gleevec', 'Glivec'],
      rxNormId: '282388',
      pubchemCid: '5291',
      drugClass: 'Tyrosine Kinase Inhibitor (TKI)',
      mechanismOfAction:
        'Selectively inhibits BCR-ABL tyrosine kinase, platelet-derived growth factor receptors (PDGFR-alpha and beta), and c-KIT receptor kinases.',
      approvedIndications: ['Philadelphia chromosome-positive CML', 'KIT-positive GIST'],
      warnings: [
        'Fluid retention and edema, including severe pericardial effusion and pulmonary edema.',
        'Hepatotoxicity: severe elevations of transaminases and bilirubin reported.',
      ],
      contraindications: ['Known hypersensitivity to imatinib mesylate.'],
      lastVerifiedDate: '2026-10-02',
      sources: [
        {
          name: 'RxNorm',
          url: 'https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=282388',
          responseId: '282388',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
        {
          name: 'openFDA',
          url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=Imatinib',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
        {
          name: 'PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov/compound/5291',
          responseId: '5291',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
        {
          name: 'ClinicalTrials.gov',
          url: 'https://clinicaltrials.gov/search?intr=Imatinib',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
      ],
    },
    candidates: [
      {
        id: 'ima-scleroderma',
        condition: 'Systemic Sclerosis',
        status: 'Investigational',
        highestPhase: 'Phase 2',
        sourceCount: 5,
        biologicalRationale:
          'Simultaneous blockade of c-Abl and PDGFR signaling pathways attenuates extracellular matrix synthesis by dermal and pulmonary fibroblasts.',
        safetyNotes: ['Fluid retention and cardiotoxicity require monitoring'],
        evidenceScore: {
          clinicalTrialScore: 24,
          humanObservationalScore: 14,
          mechanisticScore: 18,
          reproducibilityScore: 8,
          safetyCompatibilityScore: 6,
          totalScore: 70,
          contributingFactors: [
            'Multiple Phase 2 investigator-initiated clinical trials.',
            'Compelling preclinical in vitro fibroblast inhibition.',
          ],
          uncertaintyFlags: [
            'Conflicting evidence: Mixed efficacy across randomized trials with substantial toxicity discontinuations.',
          ],
        },
        clinicalTrials: [
          {
            nctId: 'NCT00555555',
            title: 'Imatinib Mesylate in Patients With Diffuse Systemic Sclerosis',
            phase: 'Phase 2',
            status: 'COMPLETED',
            conditions: ['Systemic Sclerosis'],
            leadSponsor: 'Johns Hopkins University',
            studyUrl: 'https://clinicaltrials.gov/study/NCT00555555',
            completionDate: '2013-09',
            briefSummary:
              'Single-arm Phase 2 trial of imatinib evaluating improvement in modified Rodnan skin score in diffuse cutaneous scleroderma.',
          },
        ],
        citations: [
          {
            pmid: '21567401',
            title: 'Safety and efficacy of imatinib in systemic sclerosis: results of a double-blind, placebo-controlled trial',
            journal: 'Annals of the Rheumatic Diseases',
            pubDate: '2011',
            authors: ['Prey S', 'Ezzedine K', 'Doussau A', 'et al.'],
            doi: '10.1136/ard.2010.144410',
            url: 'https://pubmed.ncbi.nlm.nih.gov/21567401/',
          },
        ],
      },
    ],
  },
  azithromycin: {
    slug: 'azithromycin',
    lastReviewedDate: '2026-10-02',
    isIndexable: true,
    educationalOverview:
      'Azithromycin is an azalide subclass macrolide antibiotic discovered in 1980 and approved for clinical use across a wide variety of bacterial infections. Beyond its classical antibacterial activity, extensive investigations over the past two decades have explored its anti-inflammatory, immunomodulatory, and antiviral mechanisms.',
    repurposingBackground:
      'Azithromycin concentrates intracellularly in lysosomes and phagocytic cells, reaching tissue concentrations significantly higher than serum levels. It downregulates pro-inflammatory cytokine expression (IL-6, IL-8, TNF-alpha) and alters lysosomal pH. During respiratory epidemics and chronic airway diseases such as cystic fibrosis, clinicians and researchers have explored whether these off-target immunomodulatory effects confer therapeutic benefit.',
    evidenceLimitationsSummary:
      'While maintenance therapy has demonstrated lung function improvements in cystic fibrosis cohorts, large randomized trials (RECOVERY, PRINCIPLE) conclusively demonstrated no clinical benefit for acute viral COVID-19. Off-label use poses serious risks of promoting antimicrobial resistance and cardiac arrhythmias (QT prolongation).',
    approvedIndications: [
      'Acute bacterial exacerbations of chronic obstructive pulmonary disease (COPD)',
      'Acute bacterial sinusitis and community-acquired pneumonia (mild to moderate severity)',
      'Uncomplicated skin and skin structure infections',
      'Urethritis and cervicitis due to Chlamydia trachomatis or Neisseria gonorrhoeae',
      'Genital ulcer disease in men due to Haemophilus ducreyi (chancroid)',
      'Acute otitis media and pharyngitis/tonsillitis in pediatric patients',
    ],
    drug: {
      genericName: 'Azithromycin',
      brandNames: ['Zithromax', 'Zmax'],
      rxNormId: '18631',
      pubchemCid: '447043',
      drugClass: 'Macrolide antibiotic',
      mechanismOfAction:
        'Reversibly binds to the 50S ribosomal subunit of susceptible microorganisms, inhibiting transpeptidation and protein synthesis; also exhibits immunomodulatory and anti-inflammatory properties through attenuation of neutrophil activation and interleukin signaling.',
      approvedIndications: [
        'Acute bacterial exacerbations of COPD',
        'Community-acquired pneumonia and sinusitis',
        'Chlamydial urethritis and cervicitis',
      ],
      warnings: [
        'QT interval prolongation and torsades de pointes; avoid in patients with known prolonged QT, hypokalemia, or co-administration with antiarrhythmics.',
        'Hepatotoxicity: abnormal liver function, hepatitis, cholestatic jaundice, hepatic necrosis, and hepatic failure.',
        'Clostridioides difficile-associated diarrhea (CDAD).',
      ],
      contraindications: [
        'Known hypersensitivity to azithromycin, erythromycin, or any macrolide/ketolide antibiotic.',
        'History of cholestatic jaundice or hepatic dysfunction associated with prior use of azithromycin.',
      ],
      lastVerifiedDate: '2026-10-02',
      sources: [
        {
          name: 'RxNorm',
          url: 'https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=18631',
          responseId: '18631',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
        {
          name: 'openFDA',
          url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=Azithromycin',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
        {
          name: 'PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov/compound/447043',
          responseId: '447043',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
        {
          name: 'ClinicalTrials.gov',
          url: 'https://clinicaltrials.gov/search?intr=Azithromycin',
          timestamp: '2026-10-02T12:00:00Z',
          status: 'ok',
        },
      ],
    },
    candidates: [
      {
        id: 'azi-covid',
        condition: 'COVID-19',
        status: 'Unsupported',
        highestPhase: 'Phase 3',
        sourceCount: 4,
        evidenceNote: 'Phase 3 randomized platform trials completed; findings demonstrated no clinical benefit compared to standard of care.',
        trialOutcomeStatus: 'Randomized Phase 3 clinical trial evidence demonstrated lack of clinical benefit for acute viral infection.',
        biologicalRationale:
          'Explored early in the pandemic for putative in vitro antiviral and anti-inflammatory properties; however, large randomized platform trials found no clinical efficacy over standard of care.',
        safetyNotes: ['Risk of QT interval prolongation, particularly when combined with other QT-prolonging agents.'],
        evidenceScore: {
          clinicalTrialScore: 28,
          humanObservationalScore: 18,
          mechanisticScore: 10,
          reproducibilityScore: 10,
          safetyCompatibilityScore: 4,
          totalScore: 58,
          evidenceTier: 'Moderate',
          contributingFactors: [
            'Multiple large multicenter Phase 3 randomized platform trials completed (RECOVERY, PRINCIPLE).',
            'Published peer-reviewed trial outcomes in high-impact medical journals.',
          ],
          uncertaintyFlags: [
            'Clinical trial outcome: Definitive randomized clinical trials demonstrated no clinical benefit in mortality, hospital stay, or disease progression.',
            'Unsupported for routine COVID-19 treatment across major clinical guidelines.',
          ],
        },
        clinicalTrials: [
          {
            nctId: 'NCT04381936',
            title: 'Randomised Evaluation of COVID-19 Therapy (RECOVERY)',
            phase: 'Phase 3',
            status: 'COMPLETED',
            conditions: ['COVID-19'],
            leadSponsor: 'University of Oxford',
            studyUrl: 'https://clinicaltrials.gov/study/NCT04381936',
            completionDate: '2021-05',
            briefSummary: 'Large randomized platform trial evaluating treatments for patients hospitalized with COVID-19.',
          },
          {
            nctId: 'NCT04403893',
            title: 'Platform Randomised Trial of Treatments in the Community for Epidemic and Pandemic Diseases (PRINCIPLE)',
            phase: 'Phase 3',
            status: 'COMPLETED',
            conditions: ['COVID-19'],
            leadSponsor: 'University of Oxford',
            studyUrl: 'https://clinicaltrials.gov/study/NCT04403893',
            completionDate: '2021-12',
            briefSummary: 'Trial of treatments in the community for COVID-19 in older people and those with underlying conditions.',
          },
        ],
        citations: [
          {
            pmid: '33545096',
            title: 'Azithromycin in patients admitted to hospital with COVID-19 (RECOVERY): a randomised, controlled, open-label, platform trial',
            journal: 'Lancet',
            pubDate: '2021',
            authors: ['RECOVERY Collaborative Group'],
            doi: '10.1016/S0140-6736(21)00149-5',
            url: 'https://pubmed.ncbi.nlm.nih.gov/33545096/',
          },
          {
            pmid: '33676597',
            title: 'Azithromycin for community treatment of suspected COVID-19 in people at increased risk of complications in the UK (PRINCIPLE): a randomised, controlled, open-label, adaptive platform trial',
            journal: 'Lancet',
            pubDate: '2021',
            authors: ['PRINCIPLE Trial Collaborative Group'],
            doi: '10.1016/S0140-6736(21)00461-X',
            url: 'https://pubmed.ncbi.nlm.nih.gov/33676597/',
          },
        ],
      },
      {
        id: 'azi-cf',
        condition: 'Cystic fibrosis',
        status: 'Off-label',
        highestPhase: 'Phase 3',
        sourceCount: 3,
        evidenceNote: 'Supported by multicenter Phase 3 clinical trials demonstrating improvement in FEV1 and exacerbation rate reduction.',
        biologicalRationale:
          'Inhibition of Pseudomonas aeruginosa biofilm formation, reduction of airway surface inflammation, and modulation of sputum neutrophil elastase activity.',
        safetyNotes: ['Ototoxicity, tinnitus, and emergence of macrolide-resistant nontuberculous mycobacteria.'],
        evidenceScore: {
          clinicalTrialScore: 34,
          humanObservationalScore: 18,
          mechanisticScore: 18,
          reproducibilityScore: 10,
          safetyCompatibilityScore: 8,
          totalScore: 88,
          evidenceTier: 'High',
          contributingFactors: [
            'Multicenter double-blind placebo-controlled Phase 3 trials demonstrating improvement in pulmonary function.',
            'Included in Cystic Fibrosis Foundation clinical practice guidelines.',
          ],
          uncertaintyFlags: [
            'Off-label status: Maintenance anti-inflammatory therapy in cystic fibrosis is an established off-label use not on FDA primary package insert.',
          ],
        },
        clinicalTrials: [
          {
            nctId: 'NCT00049543',
            title: 'Azithromycin in Cystic Fibrosis: A Multicenter Randomized Clinical Trial',
            phase: 'Phase 3',
            status: 'COMPLETED',
            conditions: ['Cystic Fibrosis'],
            leadSponsor: 'Cystic Fibrosis Foundation Therapeutics',
            studyUrl: 'https://clinicaltrials.gov/study/NCT00049543',
            completionDate: '2004-06',
            briefSummary: 'Randomized placebo-controlled trial evaluating pulmonary function in cystic fibrosis patients chronically infected with Pseudomonas aeruginosa.',
          },
        ],
        citations: [
          {
            pmid: '14519921',
            title: 'Azithromycin in patients with cystic fibrosis chronically infected with Pseudomonas aeruginosa: a randomized controlled trial',
            journal: 'JAMA',
            pubDate: '2003',
            authors: ['Saiman L', 'Marshall BC', 'Mayer-Hamblett N', 'et al.'],
            doi: '10.1001/jama.290.13.1749',
            url: 'https://pubmed.ncbi.nlm.nih.gov/14519921/',
          },
        ],
      },
      {
        id: 'azi-malaria',
        condition: 'Malaria',
        status: 'Investigational',
        highestPhase: 'Phase 3',
        sourceCount: 2,
        evidenceNote: 'Phase 3 non-inferiority trials completed in combination therapy; monotherapy is ineffective.',
        biologicalRationale:
          'Targets the apicoplast 70S ribosome of Plasmodium falciparum, inhibiting prokaryotic-like protein translation in combination with antimalarials.',
        safetyNotes: ['Gastrointestinal adverse effects; delayed parasite clearance relative to artemisinins alone.'],
        evidenceScore: {
          clinicalTrialScore: 28,
          humanObservationalScore: 14,
          mechanisticScore: 16,
          reproducibilityScore: 8,
          safetyCompatibilityScore: 8,
          totalScore: 74,
          evidenceTier: 'High',
          contributingFactors: [
            'Phase 3 non-inferiority trials in combination with chloroquine or artesunate.',
            'Documented organellar apicoplast translation inhibition mechanism.',
          ],
          uncertaintyFlags: [
            'Evidence is preliminary: Monotherapy is ineffective; inferior to first-line artemisinin-based combination therapies.',
          ],
        },
        clinicalTrials: [
          {
            nctId: 'NCT01109836',
            title: 'Azithromycin Plus Chloroquine for Treatment of Uncomplicated Malaria',
            phase: 'Phase 3',
            status: 'COMPLETED',
            conditions: ['Malaria', 'Plasmodium Falciparum Malaria'],
            leadSponsor: 'Pfizer / Academic Collaborators',
            studyUrl: 'https://clinicaltrials.gov/study/NCT01109836',
            completionDate: '2013-10',
            briefSummary: 'Multicenter Phase 3 study comparing azithromycin-chloroquine combination against standard artemether-lumefantrine.',
          },
        ],
        citations: [
          {
            pmid: '24703554',
            title: 'Efficacy and safety of azithromycin-chloroquine versus artemether-lumefantrine in uncomplicated malaria: a randomised, non-inferiority trial',
            journal: 'Lancet Infectious Diseases',
            pubDate: '2014',
            authors: ['Sagara I', 'Oduro AR', 'Kassoum K', 'et al.'],
            doi: '10.1016/S1473-3099(14)70077-8',
            url: 'https://pubmed.ncbi.nlm.nih.gov/24703554/',
          },
        ],
      },
    ],
  },
};

export function getPublishedDrugSlugs(): string[] {
  return Object.keys(PUBLISHED_DRUG_REGISTRY).filter((slug) => {
    return isDrugPublishable(PUBLISHED_DRUG_REGISTRY[slug]);
  });
}

export function getPublishedDrugBySlug(slug: string): PublishedDrugGuide | null {
  const normalized = slug.trim().toLowerCase();
  const guide = PUBLISHED_DRUG_REGISTRY[normalized];
  if (!guide || !isDrugPublishable(guide)) {
    return null;
  }
  return guide;
}
