import type { Metadata } from 'next';
import Link from 'next/link';

import { 
  getAbsoluteUrl, 
  generateArticleJsonLd, 
  generateBreadcrumbJsonLd, 
  CREATOR_ATTRIBUTION 
} from '@/lib/seo';
import { 
  BookOpen, 
  ShieldAlert, 
  CheckCircle, 
  ArrowRight, 
  Calendar, 
  User, 
  ExternalLink,
  ArrowLeft
} from 'lucide-react';

const PAGE_TITLE = 'What Is Drug Repurposing? Evidence, Methods, and Limitations';
const PAGE_DESCRIPTION =
  'An educational guide to drug repurposing (repositioning): historical breakthroughs, modern computational methodologies, clinical trial requirements, and biological limitations.';
const PAGE_PATH = '/what-is-drug-repurposing';
const DATE_PUBLISHED = '2026-10-02';
const DATE_MODIFIED = '2026-10-02';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: getAbsoluteUrl(PAGE_PATH),
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

export default function WhatIsDrugRepurposingPage() {
  const articleJsonLd = generateArticleJsonLd({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    path: PAGE_PATH,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
  });

  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: 'Workspace', path: '/' },
    { name: 'What Is Drug Repurposing', path: PAGE_PATH },
  ]);

  return (
    <div className="flex-1 flex flex-col pb-16 md:pb-6 text-slate-900">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 no-print h-5">
          <Link href="/" className="hover:text-teal-800 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate">What Is Drug Repurposing</span>
        </nav>

        {/* Article Header */}
        <header className="border-b border-slate-200 pb-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 tracking-wide font-mono">
            <BookOpen className="w-3.5 h-3.5 text-teal-700" />
            <span>Biomedical Research Guide</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Understanding Evidence-Based Drug Repurposing
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            A comprehensive review of drug repositioning science: how approved pharmaceutical agents are investigated for novel therapeutic indications, the methods used to identify candidates, and why clinical trial validation remains mandatory.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>Prepared by {CREATOR_ATTRIBUTION.name}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Last reviewed: {DATE_MODIFIED}</span>
            </span>
          </div>
        </header>

        {/* Clinical Disclaimer Notice */}
        <section aria-label="Research Notice" className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-950 space-y-1">
              <h2 className="font-bold text-amber-900">Research & Educational Purpose Only</h2>
              <p className="leading-relaxed">
                Drug repurposing hypotheses discuss investigational observations and registered trial protocols. 
                This guide does not advocate or recommend off-label prescribing, self-medication, or therapeutic decisions. 
                Always consult primary biomedical literature and licensed medical professionals.
              </p>
            </div>
          </div>
        </section>

        {/* Section 1: Definition */}
        <section aria-labelledby="definition-heading" className="space-y-3 bg-white p-6 rounded-lg border border-slate-200">
          <h2 id="definition-heading" className="text-lg sm:text-xl font-bold text-slate-900">
            1. Definition & Core Concept
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            <strong>Drug repurposing</strong>—also referred to as drug repositioning, reprofiling, or rediscovery—is the strategy of identifying new therapeutic uses for existing, approved, discontinued, or investigational chemical entities that fall outside the scope of their original medical indication.
          </p>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            In contrast to <em>de novo</em> drug discovery, which typically demands 12 to 15 years and over $1 billion to advance from initial hit-to-lead synthesis through Phase 3 trials, repurposing begins with compounds that possess characterized chemical synthesis routes, established preclinical toxicity profiles, and known pharmacokinetic properties in humans.
          </p>
        </section>

        {/* Section 2: Historical Examples */}
        <section aria-labelledby="examples-heading" className="space-y-4 bg-white p-6 rounded-lg border border-slate-200">
          <h2 id="examples-heading" className="text-lg sm:text-xl font-bold text-slate-900">
            2. Classical Paradigms in Drug Repositioning
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Many early drug repurposing discoveries occurred through serendipitous clinical observation rather than rational design:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="border border-slate-200 rounded p-3.5 bg-slate-50">
              <h3 className="font-bold text-slate-900 mb-1">
                <Link href="/drug/thalidomide" className="text-teal-800 hover:underline">
                  Thalidomide → Multiple Myeloma
                </Link>
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Initially introduced in Europe as a sedative and anti-emetic for morning sickness before global withdrawal for teratogenicity, thalidomide was later found to inhibit angiogenesis and bind the cereblon (CRBN) E3 ubiquitin ligase, transforming modern multiple myeloma treatment.
              </p>
            </div>

            <div className="border border-slate-200 rounded p-3.5 bg-slate-50">
              <h3 className="font-bold text-slate-900 mb-1">
                Sildenafil → Erectile Dysfunction & PAH
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Originally synthesized by Pfizer to treat angina pectoris through PDE5 inhibition in coronary vessels, trial participants noted marked pelvic vasodilation, resulting in repurposing for erectile dysfunction (Viagra) and subsequently pulmonary arterial hypertension (Revatio).
              </p>
            </div>

            <div className="border border-slate-200 rounded p-3.5 bg-slate-50">
              <h3 className="font-bold text-slate-900 mb-1">
                <Link href="/drug/metformin" className="text-teal-800 hover:underline">
                  Metformin → Polycystic Ovary Syndrome
                </Link>
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Standard first-line therapy for type 2 diabetes mellitus, metformin&apos;s suppression of hepatic gluconeogenesis and systemic insulin reduction led to landmark trials demonstrating restored ovulatory cycles in women with PCOS.
              </p>
            </div>

            <div className="border border-slate-200 rounded p-3.5 bg-slate-50">
              <h3 className="font-bold text-slate-900 mb-1">
                <Link href="/drug/imatinib" className="text-teal-800 hover:underline">
                  Imatinib → GIST & Fibrotic Disease
                </Link>
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Designed to selectively inhibit BCR-ABL kinase in chronic myeloid leukemia, secondary inhibition of KIT and PDGFR receptors enabled rapid expansion into gastrointestinal stromal tumors and systemic sclerosis trials.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Modern Identification Methodologies */}
        <section aria-labelledby="methods-heading" className="space-y-3 bg-white p-6 rounded-lg border border-slate-200">
          <h2 id="methods-heading" className="text-lg sm:text-xl font-bold text-slate-900">
            3. Modern Computational & Experimental Methodologies
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Contemporary pharmaceutical repurposing has shifted from accidental discovery toward systematic data-driven strategies:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 pl-4 list-disc">
            <li>
              <strong>Target-Based Screening:</strong> Molecular docking and high-throughput virtual screening of approved compound libraries against crystallized 3D target proteins.
            </li>
            <li>
              <strong>Transcriptomic Connectivity Mapping (CMap):</strong> Comparing disease gene-expression signatures against drug-induced perturbation signatures to identify inverse gene patterns that may reverse disease phenotypes.
            </li>
            <li>
              <strong>Electronic Health Record (EHR) Data Mining:</strong> Retrospective pharmacoepidemiological analysis of large patient cohorts taking medications for primary conditions to detect reduced incidence of secondary diseases.
            </li>
            <li>
              <strong>Biomedical Knowledge Graphs:</strong> Integrating heterogeneous networks linking compounds, genes, biological pathways, and clinical trial outcomes.
            </li>
          </ul>
        </section>

        {/* Section 4: Why Clinical Trials Remain Mandatory */}
        <section aria-labelledby="trials-importance-heading" className="space-y-3 bg-white p-6 rounded-lg border border-slate-200">
          <h2 id="trials-importance-heading" className="text-lg sm:text-xl font-bold text-slate-900">
            4. Why Phase 2 & 3 Clinical Trials Are Mandatory
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            A common misconception in drug repurposing is that because a drug is already approved for one condition, it can be immediately assumed safe or effective for another. In clinical reality:
          </p>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Dose and Exposure Mismatches:</strong> A compound active against a novel receptor <em>in vitro</em> may require systemic concentrations that exceed maximum tolerated doses in humans, causing organ toxicity.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Altered Patient Populations:</strong> An oncology patient cohort with renal impairment or immunosuppression may experience catastrophic toxicity from a drug well-tolerated in young diabetic patients.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Conflicting Disease Pathophysiology:</strong> Known adverse events (such as cardiovascular fluid retention) may directly exacerbate the candidate condition.
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 pt-2">
            For these reasons, registered interventional trials (indexed in{' '}
            <a
              href="https://clinicaltrials.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-800 underline inline-flex items-center gap-0.5"
            >
              <span>ClinicalTrials.gov</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            ) remain the gold standard for verifying real-world efficacy.
          </p>
        </section>

        {/* Section 5: Regulatory Mechanisms */}
        <section aria-labelledby="regulatory-heading" className="space-y-3 bg-white p-6 rounded-lg border border-slate-200">
          <h2 id="regulatory-heading" className="text-lg sm:text-xl font-bold text-slate-900">
            5. Regulatory Pathways (e.g. FDA 505(b)(2))
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            In the United States, drug repurposing sponsors frequently leverage the FDA Section 505(b)(2) New Drug Application pathway. This statutory mechanism allows the applicant to rely in part on the FDA&apos;s previous findings of safety and efficacy for the approved drug, substantially reducing preclinical animal studies while focusing resources on proving safety and efficacy for the new indication.
          </p>
        </section>

        {/* Authoritative Citations */}
        <section aria-labelledby="citations-heading" className="space-y-3 border-t border-slate-200 pt-6">
          <h2 id="citations-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Authoritative References & Literature
          </h2>
          <ul className="space-y-1.5 text-xs text-slate-600">
            <li>
              Pushpakom, S., et al. (2019). &ldquo;Drug repurposing: progress, challenges and recommendations.&rdquo;{' '}
              <em>Nature Reviews Drug Discovery</em>, 18(1), 41–58. DOI: 10.1038/nrd.2018.168.
            </li>
            <li>
              National Center for Advancing Translational Sciences (NCATS). &ldquo;Repurposing Therapeutics.&rdquo; National Institutes of Health.
            </li>
            <li>
              U.S. Food and Drug Administration (FDA). Guidance for Industry: Applications Covered by Section 505(b)(2).
            </li>
          </ul>
        </section>

        {/* Navigation Call-to-Action */}
        <div className="bg-slate-100 rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Explore Evidence on Live Compounds</h3>
            <p className="text-xs text-slate-600">
              Query real clinical trials and PubMed records for candidates in our database.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/methodology"
              className="px-3.5 py-2 bg-white text-slate-800 text-xs font-semibold rounded border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Scoring Methodology
            </Link>
            <Link
              href="/"
              className="px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <span>Search a Drug</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
