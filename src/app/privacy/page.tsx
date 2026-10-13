import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Lock, 
  Trash2, 
  ShieldCheck, 
  Mail, 
  Clock, 
  Database, 
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { generateBreadcrumbJsonLd, generateArticleJsonLd, getCanonicalUrl, CREATOR_ATTRIBUTION } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Retention Policy',
  description:
    'Transparent privacy terms for Repurpose: zero commercial tracking, mandatory 30-day notebook auto-purge, anonymous biomedical queries, and prohibition of patient health information (PHI).',
  alternates: {
    canonical: getCanonicalUrl('/privacy'),
  },
  openGraph: {
    title: 'Privacy Policy & Data Retention | Repurpose',
    description:
      'Learn how Repurpose safeguards investigator confidentiality, enforces a 30-day auto-purge for saved dossiers, and strictly prohibits patient-identifiable data.',
    url: getCanonicalUrl('/privacy'),
    type: 'article',
  },
};

export default function PrivacyPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Workspace', url: '/' },
    { name: 'Privacy Policy', url: '/privacy' },
  ]);

  const articleJsonLd = generateArticleJsonLd({
    headline: 'Privacy Policy & Data Retention Terms | Repurpose',
    description:
      'Privacy policy, confidentiality protections, 30-day data retention policy, and health data prohibition for the Repurpose platform.',
    path: '/privacy',
    datePublished: '2025-01-15T00:00:00Z',
    dateModified: '2026-10-03T00:00:00Z',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="flex-1 flex flex-col pb-16 md:pb-6 text-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex-1 w-full">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 no-print h-5">
            <Link href="/" className="hover:text-teal-800 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate">Privacy Policy</span>
          </nav>

          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 tracking-wide font-mono">
              <Lock className="w-3.5 h-3.5 text-teal-700" />
              <span>Data Protection &amp; Confidentiality</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-heading">
              Privacy &amp; Data Retention Policy
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Repurpose is built on the fundamental principle that biomedical research and academic inquiry must remain private, confidential, and free from commercial surveillance.
            </p>
          </div>

          {/* Highlighted Red Disclaimer & PHI Prohibition Banner */}
          <div className="p-4 sm:p-5 rounded-xl bg-red-50 border-2 border-red-300 shadow-xs flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs sm:text-sm text-red-900">
              <span className="text-red-950 font-bold uppercase tracking-wider block">
                Strict Prohibition: No Protected Health Information (PHI)
              </span>
              <p className="text-red-700 leading-relaxed font-medium">
                Repurpose is an open-source academic evidence tool for pharmacological hypothesis exploration. 
                <strong className="text-red-950"> Do NOT enter patient names, medical record numbers, dates of birth, clinical notes, or any Protected Health Information (PHI/PII). </strong>
                This platform is strictly for research and education, not for clinical patient management, medical charting, or prescribing.
              </p>
            </div>
          </div>

          {/* Core Privacy Guarantees */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
              Core Privacy Guarantees
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                We do not monetize user data, track individual research habits across the web, or sell analytics to pharmaceutical marketing firms or data brokers.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs">
                <li>
                  <strong className="text-slate-900">Zero Advertising Trackers:</strong> We do not include third-party marketing pixels, social tracking widgets, or behavioral ad scripts.
                </li>
                <li>
                  <strong className="text-slate-900">Anonymous Public Search:</strong> Searching for drug candidates (e.g. Metformin, Azithromycin) does not require creating an account or logging in.
                </li>
                <li>
                  <strong className="text-slate-900">Stateless External Queries:</strong> API requests made to NIH/FDA public endpoints (RxNorm, openFDA, PubChem, ClinicalTrials.gov, PubMed) contain only the public compound or condition terms being researched, with no user identifiers attached.
                </li>
              </ul>
            </div>
          </section>

          {/* User Data Stored */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-700" />
              What Information We Collect &amp; Store
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                We collect only the minimum data necessary to provide personalized research notebook features:
              </p>
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-xs mb-1">1. Optional Google Authentication</div>
                  <p className="text-xs text-slate-600">
                    If you choose to sign in with Google to sync your Research Notebook across devices, we receive your name, email address, and account identifier via Firebase Authentication. We use this exclusively to authenticate access to your personal cloud notebook.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-xs mb-1">2. Private Research Notebook Notes &amp; Saved Dossiers</div>
                  <p className="text-xs text-slate-600">
                    Custom notes, checklists, and saved evidence dossiers that you explicitly create in the Notebook workspace are stored in authenticated cloud storage (Firebase Firestore) or in your local browser storage if using Guest Mode.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Retention & 30-Day Auto-Purge Policy */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-700" />
              Data Retention &amp; 30-Day Auto-Purge Policy
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                To uphold strict data minimization and protect investigator privacy:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs">
                <li>
                  <strong className="text-slate-900">Mandatory 30-Day Auto-Purge:</strong> All saved notebook dossiers, custom notes, and temporary research entries are automatically scheduled for permanent deletion from our databases 30 days after creation.
                </li>
                <li>
                  <strong className="text-slate-900">Local Preservation:</strong> Because data is automatically purged, investigators are encouraged to use the <strong className="text-slate-900">Print / Save PDF</strong> feature in the Notebook or Drug Dossier views to maintain permanent records on their local machine.
                </li>
                <li>
                  <strong className="text-slate-900">Immediate User-Initiated Deletion:</strong> You may at any time delete individual notes or purge your entire notebook history directly from the Notebook interface with a single click.
                </li>
              </ul>
            </div>
          </section>

          {/* User Rights & Data Deletion Requests */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-teal-700" />
              Your Rights &amp; Data Deletion Requests
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              In accordance with global privacy best practices (including GDPR and CCPA principles), you have full ownership of your data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs">
              <li>The right to export your research summaries as PDF / print copies.</li>
              <li>The right to immediately erase all saved notes, history, and account records.</li>
              <li>The right to request manual account termination and total record deletion.</li>
            </ul>
          </section>

          {/* Contact & Governance */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Privacy Governance &amp; Inquiries</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Open-source tool prepared by <strong className="text-slate-900">{CREATOR_ATTRIBUTION.name}</strong>. For inquiries regarding data protection, privacy questions, or removal requests, please contact:
            </p>
            <div className="flex items-center gap-2 text-sm text-teal-800 pt-1">
              <Mail className="w-4 h-4 text-teal-700" />
              <span className="text-slate-600">Contact:</span>
              <a
                href={`mailto:${CREATOR_ATTRIBUTION.email}`}
                className="font-medium text-teal-800 hover:text-teal-900 hover:underline font-mono text-xs sm:text-sm"
              >
                {CREATOR_ATTRIBUTION.email}
              </a>
            </div>
          </section>

          {/* Footer Navigation Links */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-200 gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-teal-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              About Repurpose &amp; Mission
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white transition-colors shadow-xs"
            >
              Read Scoring Methodology
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
