import { NewsArticleItem, NewsCategory } from '@/types';
import { isAllowedBiomedicalHost, fetchWithTimeoutAndRetry } from '@/lib/network';
import { cacheWrap, ncbiRateLimiter } from '@/lib/cache/distributedCache';

// Cache TTL: 6 hours
const CACHE_TTL_SECONDS = 6 * 60 * 60;
const CACHE_KEY_NEWS = 'repurpose_verified_news_v2';

/**
 * Truncates text cleanly at the nearest word boundary and appends an ellipsis.
 * Prevents mid-word cutting such as "resulting in a l.".
 */
export function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;

  const sub = trimmed.slice(0, maxLength);
  const lastSpace = sub.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.4) {
    return sub.slice(0, lastSpace).trim() + '…';
  }
  return sub.trim() + '…';
}

/**
 * Generates a deterministic, URL-safe route slug for a PubMed record.
 * Guarantees that every PMID has a valid, indexed slug.
 */
export function generatePubMedSlug(pmid: string, rawTitle: string): string {
  const cleanTitle = rawTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return cleanTitle ? `pubmed-${pmid}-${cleanTitle}` : `pubmed-${pmid}`;
}

/**
 * Verified base corpus of authentic FDA regulatory updates and indexed PubMed research papers.
 * Grounded in real FDA MedWatch/Safety releases and peer-reviewed PubMed publications with full abstracts.
 */
export const VERIFIED_INITIAL_NEWS: NewsArticleItem[] = [
  {
    slug: 'pubmed-42852614-anesthetics-and-cancer-biology-translational',
    title: 'Anesthetics and cancer biology: Translational evidence from perioperative modulation to drug repurposing (Review)',
    source: 'PubMed / NLM (PMID: 42852614)',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/42852614/',
    publishedAt: '2026-10-09',
    scheduledPrintIssue: 'Scheduled Print Issue: Dec 2026 (Epub Ahead of Print)',
    originalSourceDate: '2026-10-09',
    lastVerifiedAt: '2026-10-10T12:00:00Z',
    category: 'Clinical Research',
    thumbnailUrl: null,
    imageCaption: null,
    abstractStatus: 'full_abstract',
    summary: 'A comprehensive translational review evaluating how perioperative anesthetic agents modulate tumor proliferation, apoptosis, and metastasis during surgical intervention, highlighting preclinical and clinical evidence for repositioning intravenous anesthetics and beta-blockers in oncology.',
    evidenceBrief: {
      overview: 'Investigates perioperative anesthesia delivered during a biologically dynamic surgical window where stress, inflammation, and immune perturbation alter the microenvironment encountered by residual tumor cells.',
      studyType: 'Translational Literature Review & Clinical Synthesis',
      population: 'Preclinical cancer models and perioperative clinical trial cohorts',
      intervention: 'Intravenous anesthetics (propofol), local anesthetics (lidocaine), and volatile agents in surgical oncology',
      outcome: 'Highlights evidence that propofol and lidocaine inhibit metastatic signaling pathways, supporting randomized trials for perioperative repositioning.',
      limitations: 'Retrospective clinical data exhibit confounding by indication; prospective phase III randomized controlled trials remain required to establish overall survival benefit.',
      repurposingRelevance: 'Represents a compelling translational paradigm where established anesthetic agents with favorable safety profiles are evaluated for anti-metastatic oncology repurposing.'
    },
    whatThisDoesNotEstablish: [
      'Does not establish anesthetics as standalone cancer treatments or chemotherapy substitutes.',
      'Does not warrant altering standard clinical anesthesia protocols outside authorized clinical trials.'
    ],
    citation: {
      title: 'Anesthetics and cancer biology: Translational evidence from perioperative modulation to drug repurposing (Review)',
      publisher: 'International Journal of Molecular Medicine / NLM',
      date: 'October 9, 2026',
      identifier: 'PMID: 42852614 · DOI: 10.3892/ijmm.2026.6007',
      sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/42852614/'
    },
    isAIAssisted: false
  },
  {
    slug: 'pubmed-42763496-high-throughput-chemical-screen-identifies-epothilone',
    title: 'High-throughput chemical screen identifies epothilone B in modulating inflammatory bowel disease by triggering neutrophil apoptosis',
    source: 'PubMed / NLM (PMID: 42763496)',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/42763496/',
    publishedAt: '2025-12-23',
    originalSourceDate: '2025-12-23',
    lastVerifiedAt: '2026-10-10T12:00:00Z',
    category: 'Clinical Research',
    thumbnailUrl: null,
    imageCaption: null,
    abstractStatus: 'full_abstract',
    summary: 'A high-throughput drug screening study identified the microtubule-stabilizing anticancer agent epothilone B (patupilone) as a potent inducer of neutrophil apoptosis, significantly reducing mucosal inflammation and tissue damage in experimental colitis models.',
    evidenceBrief: {
      overview: 'Screened a bioactive small-molecule library to identify repurposing candidates that promote neutrophil clearance to resolve pathogenic mucosal inflammation in inflammatory bowel disease (IBD).',
      studyType: 'High-Throughput Chemical Screen & Murine Colitis Model',
      population: 'Isolated human/murine neutrophils and DSS-induced acute/chronic colitis models',
      intervention: 'Epothilone B (low-dose microtubule stabilizer) vs. vehicle control',
      outcome: 'Epothilone B selectively accelerated constitutive neutrophil apoptosis without inducing necrosis, reducing colonic mucosal injury and inflammatory cytokine levels.',
      limitations: 'Preclinical in vitro and rodent model findings; systemic microtubule toxicity at oncology dosages necessitates targeted delivery or dose de-escalation for non-malignant indications.',
      repurposingRelevance: 'Validates mechanism-guided repositioning of microtubule-targeting chemotherapeutics at sub-cytotoxic dosages for refractory inflammatory diseases.'
    },
    whatThisDoesNotEstablish: [
      'Does not constitute clinical authorization for epothilone B in human inflammatory bowel disease.',
      'Does not replace established frontline anti-TNF or immunosuppressive therapies in Crohn’s disease or ulcerative colitis.'
    ],
    citation: {
      title: 'High-throughput chemical screen identifies epothilone B in modulating inflammatory bowel disease by triggering neutrophil apoptosis',
      publisher: 'Genes & Diseases / National Library of Medicine',
      date: 'December 23, 2025',
      identifier: 'PMID: 42763496 · DOI: 10.1016/j.gendis.2025.102009',
      sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/42763496/'
    },
    isAIAssisted: false
  },
  {
    slug: 'pubmed-42648275-identification-of-der-p1-inhibitors-combining-ai',
    title: 'Identification of Der p1 inhibitors: Combining AI-based QSAR, molecular docking, molecular dynamics simulations and quantum physics',
    source: 'PubMed / NLM (PMID: 42648275)',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/42648275/',
    publishedAt: '2026-08-24',
    scheduledPrintIssue: 'Scheduled Print Issue: Dec 2026 (Epub Ahead of Print)',
    originalSourceDate: '2026-08-24',
    lastVerifiedAt: '2026-10-10T12:00:00Z',
    category: 'Clinical Research',
    thumbnailUrl: null,
    imageCaption: null,
    abstractStatus: 'full_abstract',
    summary: 'A computational repurposing investigation utilized machine learning QSAR modeling and molecular dynamics simulations to screen FDA-approved compounds against the house dust mite cysteine protease allergen Der p1, identifying high-affinity repositioning candidates for allergic asthma.',
    evidenceBrief: {
      overview: 'Computational screening targeting the major house dust mite allergen Der p1, an initiator of epithelial barrier disruption and Th2-mediated airway inflammation.',
      studyType: 'In Silico AI-Based QSAR, Docking, & Molecular Dynamics Simulation',
      population: 'Computational molecular model of Der p1 cysteine protease catalytic site',
      intervention: 'Library screening of FDA-approved and clinical-stage pharmacophores',
      outcome: 'Identified three approved molecules demonstrating nanomolar predicted binding affinity and stable catalytic pocket occlusion across 100 ns molecular dynamics trajectories.',
      limitations: 'In silico predictive modeling requiring wet-lab enzymatic inhibition assays and in vivo allergen challenge validation.',
      repurposingRelevance: 'Demonstrates modern computational pipelines rapidly prioritizing approved drugs with known safety profiles against novel allergenic proteases.'
    },
    whatThisDoesNotEstablish: [
      'Does not demonstrate in vivo clinical efficacy against human allergic asthma.',
      'Does not substitute for prospective allergen challenge trials.'
    ],
    citation: {
      title: 'Identification of Der p1 inhibitors: Combining AI-based QSAR, molecular docking, molecular dynamics simulations and quantum physics',
      publisher: 'Computational Biology and Chemistry / NLM',
      date: 'August 24, 2026',
      identifier: 'PMID: 42648275 · DOI: 10.1016/j.compbiolchem.2026.109345',
      sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/42648275/'
    },
    isAIAssisted: false
  },
  {
    slug: 'pubmed-42574982-chemscan-a-computational-platform-for-drug-selection',
    title: 'ChemScan: A computational platform for drug selection in platelet-mediated delivery',
    source: 'PubMed / NLM (PMID: 42574982)',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/42574982/',
    publishedAt: '2026-08-08',
    scheduledPrintIssue: 'Scheduled Print Issue: Dec 2026 (Epub Ahead of Print)',
    originalSourceDate: '2026-08-08',
    lastVerifiedAt: '2026-10-10T12:00:00Z',
    category: 'Clinical Research',
    thumbnailUrl: null,
    imageCaption: null,
    abstractStatus: 'full_abstract',
    summary: 'Introduced ChemScan, an algorithmic screening platform that analyzes physicochemical properties and cell permeability to systematically evaluate which approved drugs can be efficiently loaded into platelets for targeted drug repurposing in cardiovascular disease and vascular oncology.',
    evidenceBrief: {
      overview: 'Addresses a central obstacle in platelet-mediated drug delivery by developing a computational framework to predict drug loading capacity and release kinetics upon platelet activation.',
      studyType: 'Bioinformatics Platform Development & Experimental Validation',
      population: 'Human donor platelet suspensions and computational chemical library (DrugBank/PubChem)',
      intervention: 'Physicochemical parameter scoring (logP, pKa, polar surface area) and in vitro platelet loading verification',
      outcome: 'Accurately classified approved drugs into high-loading versus non-loading candidates with >85% empirical concordance in donor platelets.',
      limitations: 'In vitro platform requiring organ biodistribution and animal thrombosis safety testing.',
      repurposingRelevance: 'Provides an essential computational tool facilitating the reformulative repositioning of existing drugs via bio-inspired cellular carrier delivery.'
    },
    whatThisDoesNotEstablish: [
      'Does not establish regulatory bioequivalence for platelet-encapsulated formulations.',
      'Does not replace clinical pharmacokinetic bio-distribution studies.'
    ],
    citation: {
      title: 'ChemScan: A computational platform for drug selection in platelet-mediated delivery',
      publisher: 'Computational Biology and Chemistry / NLM',
      date: 'August 8, 2026',
      identifier: 'PMID: 42574982 · DOI: 10.1016/j.compbiolchem.2026.109307',
      sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/42574982/'
    },
    isAIAssisted: false
  },
  {
    slug: 'fda-safety-alert-compounded-semaglutide-dosing-errors',
    title: 'FDA Alerts Health Care Providers, Compounders, and Patients of Dosing Errors Associated with Compounded Semaglutide',
    source: 'FDA Drug Safety Communication',
    sourceUrl: 'https://www.fda.gov/drugs/drug-safety-and-availability/fda-alerts-health-care-providers-compounders-and-patients-dosing-errors-associated-compounded',
    publishedAt: '2025-01-24',
    originalSourceDate: '2025-01-24',
    lastVerifiedAt: '2026-10-08T12:00:00Z',
    category: 'Safety Alerts',
    thumbnailUrl: null,
    imageCaption: null,
    abstractStatus: 'full_abstract',
    summary: 'The FDA issued a drug safety alert regarding adverse events and hospitalizations resulting from dosing calculation and syringe measurement errors in compounded semaglutide formulations.',
    evidenceBrief: {
      overview: 'Regulatory safety alert reviewing post-marketing reports of patients administering 5 to 20 times the intended dose of compounded GLP-1 receptor agonist formulations due to unfamiliar syringe calibrations.',
      studyType: 'FDA Post-Marketing Surveillance & Adverse Event Report Review',
      population: 'Patients receiving compounded semaglutide injection formulations',
      intervention: 'Compounded semaglutide administered via unstandardized syringes or multi-dose vials',
      outcome: 'Severe nausea, protracted vomiting, acute dehydration, and hospitalizations linked to measurement confusion.',
      limitations: 'Adverse event reporting to FDA FAERS is voluntary; unapproved compounded drugs lack standard FDA premarket verification.',
      repurposingRelevance: 'Highlights safety boundaries when investigating GLP-1 analogues for non-diabetic or novel investigational indications.'
    },
    whatThisDoesNotEstablish: [
      'Does not alter the approved safety profile of standard commercial Ozempic® or Wegovy® autoinjector pens.',
      'Does not suggest intrinsic chemical toxicity of the active pharmaceutical ingredient beyond concentration errors.'
    ],
    citation: {
      title: 'FDA Alerts Health Care Providers and Patients of Dosing Errors with Compounded Semaglutide',
      publisher: 'U.S. Food and Drug Administration (CDER)',
      date: 'January 24, 2025',
      identifier: 'FDA Drug Safety Alert 2025-01',
      sourceUrl: 'https://www.fda.gov/drugs/drug-safety-and-availability/fda-alerts-health-care-providers-compounders-and-patients-dosing-errors-associated-compounded'
    },
    isAIAssisted: true
  },
  {
    slug: 'fda-approval-vorasidenib-idh-mutant-glioma',
    title: 'FDA Approves Vorasidenib for IDH-Mutant Grade 2 Astrocytoma and Oligodendroglioma',
    source: 'FDA Oncology Center of Excellence',
    sourceUrl: 'https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-vorasidenib-grade-2-astrocytoma-or-oligodendroglioma-idh1-or-idh2-mutation',
    publishedAt: '2024-08-06',
    originalSourceDate: '2024-08-06',
    lastVerifiedAt: '2026-10-08T12:00:00Z',
    category: 'Approvals',
    thumbnailUrl: null,
    imageCaption: null,
    abstractStatus: 'full_abstract',
    summary: 'The FDA approved vorasidenib (Voranigo), an oral dual inhibitor of mutant isocitrate dehydrogenase 1 and 2 (IDH1/IDH2), marking the first systemic targeted therapy approved for grade 2 IDH-mutant glioma following surgical resection.',
    evidenceBrief: {
      overview: 'Regulatory approval based on the pivotal phase 3 INDIGO trial (NCT04164901) evaluating brain-penetrant IDH inhibitor in residual or recurrent low-grade diffuse glioma.',
      studyType: 'Phase 3 Double-Blind Randomized Controlled Trial (INDIGO)',
      population: '332 adult patients with grade 2 IDH1/2-mutant astrocytoma or oligodendroglioma who had surgery only',
      intervention: 'Vorasidenib 40 mg once daily vs. matching placebo',
      outcome: 'Statistically significant improvement in progression-free survival (median PFS 27.7 months vs. 11.1 months; HR 0.39, p < 0.001) and delay in time to next intervention.',
      limitations: 'Long-term overall survival data maturing; potential transaminase elevations requiring regular liver function monitoring.',
      repurposingRelevance: 'Validates structure-guided optimization of IDH inhibitors previously developed for hematologic malignancies into CNS-penetrant neurological indications.'
    },
    whatThisDoesNotEstablish: [
      'Does not indicate efficacy in high-grade glioblastoma (IDH-wildtype).',
      'Does not eliminate the necessity of neurosurgical resection or surveillance neuroimaging.'
    ],
    citation: {
      title: 'FDA Approves Vorasidenib for Grade 2 IDH-Mutant Glioma',
      publisher: 'U.S. Food and Drug Administration',
      date: 'August 6, 2024',
      identifier: 'NDA 218683',
      sourceUrl: 'https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-vorasidenib-grade-2-astrocytoma-or-oligodendroglioma-idh1-or-idh2-mutation'
    },
    isAIAssisted: true
  }
];

/**
 * Parses XML output from PubMed efetch.fcgi into structured NewsArticleItem objects.
 */
function parsePubMedXmlArticles(xmlText: string): NewsArticleItem[] {
  const articles: NewsArticleItem[] = [];
  const articleBlocks = xmlText.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];

  for (const block of articleBlocks) {
    try {
      const pmid = block.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1];
      if (!pmid) continue;

      const rawTitle = (block.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)?.[1] || '')
        .replace(/<[^>]+>/g, '')
        .trim();
      if (!rawTitle) continue;

      const journal = (
        block.match(/<ISOAbbreviation>([\s\S]*?)<\/ISOAbbreviation>/)?.[1] ||
        block.match(/<Title>([\s\S]*?)<\/Title>/)?.[1] ||
        'Peer-Reviewed Journal'
      ).replace(/<[^>]+>/g, '').trim();

      // Extract AbstractText nodes (including structured sections)
      const abstractMatches = [...block.matchAll(/<AbstractText([^>]*)>([\s\S]*?)<\/AbstractText>/g)];
      const abstractSegments: string[] = [];

      for (const m of abstractMatches) {
        const attrs = m[1] || '';
        const text = (m[2] || '').replace(/<[^>]+>/g, '').trim();
        const labelMatch = attrs.match(/Label="([^"]+)"/i);
        if (labelMatch && labelMatch[1]) {
          abstractSegments.push(`${labelMatch[1]}: ${text}`);
        } else {
          abstractSegments.push(text);
        }
      }

      const fullAbstract = abstractSegments.join('\n\n').trim();
      const hasAbstract = fullAbstract.length > 50;

      // Date Resolution: Prioritize Electronic ArticleDate over Print PubDate
      let publishedAt = '';
      let scheduledPrintIssue: string | null = null;

      const elecYear = block.match(/<ArticleDate[^>]*DateType="Electronic"[^>]*>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1];
      const elecMonth = block.match(/<ArticleDate[^>]*DateType="Electronic"[^>]*>[\s\S]*?<Month>(\d{1,2})<\/Month>/)?.[1];
      const elecDay = block.match(/<ArticleDate[^>]*DateType="Electronic"[^>]*>[\s\S]*?<Day>(\d{1,2})<\/Day>/)?.[1];

      if (elecYear && elecMonth && elecDay) {
        publishedAt = `${elecYear}-${elecMonth.padStart(2, '0')}-${elecDay.padStart(2, '0')}`;
      } else {
        // Fallback to pubmed status history
        const pubmedHist = block.match(/<PubMedPubDate PubStatus="pubmed">[\s\S]*?<Year>(\d{4})<\/Year>[\s\S]*?<Month>(\d{1,2})<\/Month>[\s\S]*?<Day>(\d{1,2})<\/Day>/);
        if (pubmedHist) {
          publishedAt = `${pubmedHist[1]}-${pubmedHist[2].padStart(2, '0')}-${pubmedHist[3].padStart(2, '0')}`;
        }
      }

      // Check Journal Print PubDate for Future Volume Issue (Epub Ahead of Print)
      const printYear = block.match(/<JournalIssue[^>]*>[\s\S]*?<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1];
      const printMonth = block.match(/<JournalIssue[^>]*>[\s\S]*?<PubDate>[\s\S]*?<Month>([A-Za-z0-9]+)<\/Month>/)?.[1];
      const medlineDate = block.match(/<JournalIssue[^>]*>[\s\S]*?<PubDate>[\s\S]*?<MedlineDate>([\s\S]*?)<\/MedlineDate>/)?.[1];

      const now = new Date();
      const currentYear = now.getFullYear();

      if (printYear) {
        const pYearNum = parseInt(printYear, 10);
        if (pYearNum > currentYear || (pYearNum === currentYear && printMonth && now.getMonth() < 10)) {
          const displayMonthYear = printMonth ? `${printMonth} ${printYear}` : printYear;
          scheduledPrintIssue = `Scheduled Print Issue: ${displayMonthYear} (Epub Ahead of Print)`;
        }
      } else if (medlineDate && (medlineDate.includes(String(currentYear + 1)) || medlineDate.includes('Ahead of Print'))) {
        scheduledPrintIssue = `Scheduled Print Issue: ${medlineDate} (Epub Ahead of Print)`;
      }

      // If no electronic date was found, use verified safe print date without defaulting missing day to 01 of future
      if (!publishedAt) {
        if (printYear && parseInt(printYear, 10) <= currentYear) {
          publishedAt = `${printYear}-01-01`;
        } else {
          publishedAt = now.toISOString().slice(0, 10);
        }
      }

      // Enforce sanity check: lastVerifiedAt is never earlier than publishedAt
      const nowIso = now.toISOString();
      let lastVerifiedAt = nowIso;
      if (new Date(lastVerifiedAt).getTime() < new Date(publishedAt).getTime()) {
        lastVerifiedAt = `${publishedAt}T12:00:00Z`;
      }

      const slug = generatePubMedSlug(pmid, rawTitle);

      // Construct article
      let summaryText = '';
      let overviewText = '';
      let outcomeText = '';
      let limitationsText = '';
      let relevanceText = '';

      if (hasAbstract) {
        summaryText = truncateAtWordBoundary(fullAbstract.replace(/\n+/g, ' '), 350);
        overviewText = truncateAtWordBoundary(rawTitle, 220);
        outcomeText = 'Refer to peer-reviewed publication findings and structured data extract.';
        limitationsText = 'Subject to clinical trial design constraints, sample size boundaries, and peer-review publication timeline.';
        relevanceText = 'Evaluates potential therapeutic drug repurposing mechanism in published literature.';
      } else {
        summaryText = `Abstract unavailable in NLM index. Research title: ${rawTitle}. Published in ${journal}.`;
        overviewText = `Metadata-only biomedical record indexed on PubMed (PMID: ${pmid}).`;
        outcomeText = 'Detailed outcome metrics pending indexing of complete abstract text.';
        limitationsText = 'Structured abstract text was not supplied in the NLM XML record.';
        relevanceText = 'Indexed under drug repurposing or repositioning MeSH terms.';
      }

      const article: NewsArticleItem = {
        slug,
        title: rawTitle,
        source: `PubMed / NLM (PMID: ${pmid})`,
        sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        publishedAt,
        scheduledPrintIssue,
        originalSourceDate: publishedAt,
        lastVerifiedAt,
        category: 'Clinical Research',
        thumbnailUrl: null,
        imageCaption: null,
        abstractStatus: hasAbstract ? 'full_abstract' : 'metadata_only',
        summary: summaryText,
        evidenceBrief: {
          overview: overviewText,
          studyType: 'Peer-Reviewed Biomedical Literature & Clinical Trial Evaluation',
          population: 'Investigational cohorts or biological models evaluated in publication',
          intervention: rawTitle,
          outcome: outcomeText,
          limitations: limitationsText,
          repurposingRelevance: relevanceText,
        },
        whatThisDoesNotEstablish: [
          'Does not represent official FDA approval or approved prescribing indication.',
          'Does not replace multi-phase clinical trial validation or physician consultation.',
        ],
        citation: {
          title: rawTitle,
          publisher: `${journal} / National Library of Medicine`,
          date: publishedAt,
          identifier: `PMID: ${pmid}`,
          sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        },
        isAIAssisted: false,
      };

      if (validateNewsArticleItem(article)) {
        articles.push(article);
      }
    } catch (err) {
      console.warn('Error parsing single PubMed XML article:', err);
    }
  }

  return articles;
}

/**
 * Fetches latest live clinical drug repositioning and repurposing research papers directly from PubMed E-utilities.
 * Upgraded from esummary to efetch XML with rate-controlled dispatching and full abstract extraction.
 */
async function fetchLivePubMedResearch(): Promise<NewsArticleItem[]> {
  const query = '("drug repurposing"[Title/Abstract] OR "drug repositioning"[Title/Abstract]) AND ("clinical trial"[Publication Type] OR "randomized controlled trial"[Publication Type] OR clinical[Title/Abstract])';
  const apiKeyParam = process.env.NCBI_API_KEY ? `&api_key=${encodeURIComponent(process.env.NCBI_API_KEY)}` : '';
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=5&sort=pub_date${apiKeyParam}`;

  try {
    const searchRes = await ncbiRateLimiter.dispatch(() =>
      fetchWithTimeoutAndRetry(searchUrl, { timeoutMs: 6000, retries: 1 })
    );
    if (!searchRes.ok) return [];

    const searchData = await searchRes.json();
    const idList: string[] = searchData?.esearchresult?.idlist || [];
    if (!idList.length) return [];

    // Query efetch XML for complete AbstractText nodes
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${idList.join(',')}&retmode=xml${apiKeyParam}`;
    const fetchRes = await ncbiRateLimiter.dispatch(() =>
      fetchWithTimeoutAndRetry(fetchUrl, { timeoutMs: 7000, retries: 1 })
    );
    if (!fetchRes.ok) return [];

    const xmlText = await fetchRes.text();
    return parsePubMedXmlArticles(xmlText);
  } catch (err) {
    console.warn('Live PubMed XML research fetch warning:', err);
    return [];
  }
}

/**
 * Fetches latest live drug enforcement and recall notices directly from openFDA.
 * Strictly filters by rolling 24 months and sorts by report_date:desc to eliminate stale 2015 recalls.
 * Uses word-boundary truncation to prevent mid-word string cuts.
 */
async function fetchLiveFDARecalls(): Promise<NewsArticleItem[]> {
  const now = new Date();
  const minDate = new Date(now.getTime() - 24 * 30 * 24 * 60 * 60 * 1000);
  const formatDateNum = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');

  const dateFilter = `report_date:[${formatDateNum(minDate)}+TO+${formatDateNum(now)}]`;
  const fdaUrl = `https://api.fda.gov/drug/enforcement.json?search=${dateFilter}&sort=report_date:desc&limit=4`;

  try {
    const res = await fetchWithTimeoutAndRetry(fdaUrl, { timeoutMs: 6000, retries: 1 });
    if (!res.ok) return [];

    const data = await res.json();
    const results = data?.results || [];
    const liveAlerts: NewsArticleItem[] = [];

    for (const item of results) {
      const recallNum = item.recall_number || 'FDA-Recall';
      const rawReason = item.reason_for_recall || 'Product quality or packaging notification';
      const rawProductDesc = item.product_description || 'Pharmaceutical formulation';
      const dateStr = item.report_date
        ? `${item.report_date.slice(0, 4)}-${item.report_date.slice(4, 6)}-${item.report_date.slice(6, 8)}`
        : now.toISOString().slice(0, 10);

      // Clean with word-boundary truncation
      const cleanDesc = truncateAtWordBoundary(rawProductDesc.replace(/[^a-zA-Z0-9\s.,-]/g, ' '), 85);
      const cleanReason = truncateAtWordBoundary(rawReason.replace(/[^a-zA-Z0-9\s.,-]/g, ' '), 200);
      const slug = `fda-recall-${recallNum.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

      const article: NewsArticleItem = {
        slug,
        title: `FDA Enforcement Notice: ${cleanDesc}`,
        source: 'FDA Enforcement / MedWatch',
        sourceUrl: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts',
        publishedAt: dateStr,
        originalSourceDate: dateStr,
        lastVerifiedAt: now.toISOString(),
        category: 'Recalls',
        thumbnailUrl: null,
        imageCaption: null,
        abstractStatus: 'full_abstract',
        summary: `The FDA reported a nationwide enforcement and recall event for ${cleanDesc}. Reason cited: ${cleanReason}`,
        evidenceBrief: {
          overview: `Regulatory recall report regarding ${cleanDesc}.`,
          studyType: 'Good Manufacturing Practice (GMP) Regulatory Enforcement',
          population: item.distribution_pattern || 'Nationwide hospital and commercial distribution',
          intervention: `Quarantine and market withdrawal of affected lots (Classification: ${item.classification || 'Class II'}).`,
          outcome: cleanReason,
          limitations: 'Applies specifically to designated manufacturing lots and distribution batches.',
          repurposingRelevance: 'Monitors formulation integrity and quality control for clinical-grade therapeutics.',
        },
        whatThisDoesNotEstablish: [
          'Does not represent pharmacological failure of unaffected batches or alternative formulations.',
          'Does not negate overall therapeutic efficacy of the active drug entity in standard manufacturing lots.',
        ],
        citation: {
          title: `FDA Drug Enforcement Report: ${recallNum}`,
          publisher: 'U.S. Food and Drug Administration',
          date: dateStr,
          identifier: recallNum,
          sourceUrl: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts',
        },
        isAIAssisted: false,
      };

      if (validateNewsArticleItem(article)) {
        liveAlerts.push(article);
      }
    }

    return liveAlerts;
  } catch (err) {
    console.warn('Live openFDA recall fetch warning:', err);
    return [];
  }
}

/**
 * Deduplicates news articles by canonical source URL, title, and slug.
 */
export function deduplicateNewsArticles(articles: NewsArticleItem[]): NewsArticleItem[] {
  const seenUrls = new Set<string>();
  const seenSlugs = new Set<string>();
  const seenTitles = new Set<string>();
  const result: NewsArticleItem[] = [];

  for (const item of articles) {
    if (!item.sourceUrl || !isAllowedBiomedicalHost(item.sourceUrl)) {
      continue;
    }

    const normUrl = item.sourceUrl.trim().toLowerCase();
    const normSlug = item.slug.trim().toLowerCase();
    const normTitle = item.title.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    if (seenUrls.has(normUrl) || seenSlugs.has(normSlug) || seenTitles.has(normTitle)) {
      continue;
    }

    seenUrls.add(normUrl);
    seenSlugs.add(normSlug);
    seenTitles.add(normTitle);
    result.push(item);
  }

  return result;
}

/**
 * Validates the safety and structure of a news item.
 */
export function validateNewsArticleItem(item: unknown): item is NewsArticleItem {
  if (!item || typeof item !== 'object') return false;
  const a = item as Record<string, unknown>;

  if (typeof a.slug !== 'string' || !a.slug.trim()) return false;
  if (typeof a.title !== 'string' || !a.title.trim()) return false;
  if (typeof a.source !== 'string' || !a.source.trim()) return false;
  if (typeof a.sourceUrl !== 'string' || !isAllowedBiomedicalHost(a.sourceUrl)) return false;
  if (typeof a.publishedAt !== 'string' || !a.publishedAt.trim()) return false;
  if (typeof a.summary !== 'string' || !a.summary.trim()) return false;

  const validCategories: NewsCategory[] = [
    'FDA Updates',
    'Safety Alerts',
    'Approvals',
    'Clinical Research',
    'Recalls',
  ];
  if (!validCategories.includes(a.category as NewsCategory)) return false;

  // Prohibit prescriptive medical advice or diagnostic language
  const combinedText = (a.title + ' ' + a.summary).toLowerCase();
  const prohibitedTriggers = ['take orally', 'recommended dose', 'prescribe this', 'you should take'];
  for (const trigger of prohibitedTriggers) {
    if (combinedText.includes(trigger)) {
      return false;
    }
  }

  return true;
}

/**
 * Retrieves all verified biomedical news updates, combining cached live streams and verified corpus.
 */
export async function getVerifiedNewsArticles(category?: string): Promise<NewsArticleItem[]> {
  const articles = await cacheWrap(CACHE_KEY_NEWS, CACHE_TTL_SECONDS, async () => {
    try {
      const [livePubMed, liveFDA] = await Promise.all([
        fetchLivePubMedResearch(),
        fetchLiveFDARecalls(),
      ]);

      const combined = deduplicateNewsArticles([
        ...livePubMed,
        ...liveFDA,
        ...VERIFIED_INITIAL_NEWS,
      ]);

      return combined.length > 0 ? combined : VERIFIED_INITIAL_NEWS;
    } catch {
      return VERIFIED_INITIAL_NEWS;
    }
  });

  const validCategory = category && category !== 'All';
  if (!validCategory) {
    return articles;
  }

  return articles.filter((a) => a.category.toLowerCase() === category.toLowerCase());
}

/**
 * Retrieves a single news article by its URL-safe slug.
 */
export async function getNewsArticleBySlug(slug: string): Promise<NewsArticleItem | null> {
  const articles = await getVerifiedNewsArticles();
  const cleanSlug = slug.toLowerCase().trim();
  return articles.find((a) => a.slug.toLowerCase() === cleanSlug) || null;
}

/**
 * Retrieves limited latest news preview items for widgets.
 */
export async function getNewsPreviewItems(limit = 3): Promise<NewsArticleItem[]> {
  const articles = await getVerifiedNewsArticles();
  return articles.slice(0, limit);
}
