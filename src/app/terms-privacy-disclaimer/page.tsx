import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Scale, 
  Database, 
  Lock, 
  ExternalLink, 
  FileText, 
  Mail, 
  Code2, 
  ArrowLeft 
} from 'lucide-react';
import { generateBreadcrumbJsonLd, generateArticleJsonLd, getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Terms, Privacy & Research Disclaimer | Repurpose',
  description:
    'Official terms of use, privacy policy, source accuracy disclosures, limitation of liability, and research disclaimer for the Repurpose platform.',
  alternates: {
    canonical: getCanonicalUrl('/terms-privacy-disclaimer'),
  },
  openGraph: {
    title: 'Terms, Privacy & Research Disclaimer | Repurpose',
    description:
      'Official terms, privacy disclosures, limitation of liability, and research disclaimers for the open-source Repurpose platform.',
    url: getCanonicalUrl('/terms-privacy-disclaimer'),
    type: 'article',
  },
};

export default function TermsPrivacyDisclaimerPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'About & Privacy', url: '/about' },
    { name: 'Terms, Privacy & Research Disclaimer', url: '/terms-privacy-disclaimer' },
  ]);

  const articleJsonLd = generateArticleJsonLd({
    headline: 'Terms, Privacy & Research Disclaimer | Repurpose',
    description:
      'Official terms of use, privacy policy, medical disclaimer, and open-source licensing terms for the Repurpose research platform.',
    path: '/terms-privacy-disclaimer',
    datePublished: '2025-01-15T00:00:00Z',
    dateModified: '2026-10-08T00:00:00Z',
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

      <div className="flex-1 flex flex-col pb-16 md:pb-8 text-slate-900">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full space-y-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center text-xs text-slate-500 gap-2">
              <li>
                <Link href="/" className="hover:text-teal-800 transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/about" className="hover:text-teal-800 transition-colors">
                  About &amp; Privacy
                </Link>
              </li>
              <li>/</li>
              <li className="text-slate-800 font-semibold truncate">
                Terms, Privacy &amp; Research Disclaimer
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="space-y-2 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 tracking-wide font-mono">
              <Scale className="w-3.5 h-3.5 text-teal-700" />
              <span>Legal, Governance &amp; Research Terms</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-heading">
              Terms, Privacy &amp; Research Disclaimer
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Last updated: October 8, 2026
            </p>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed pt-2">
              Repurpose is an open, educational drug-repurposing research tool created and maintained by <strong className="text-slate-900">P. Rahul Chakradhar</strong>.
            </p>
          </div>

          {/* Section 1: Educational and research use only */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-teal-700" />
              Educational and research use only
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Repurpose is intended only for educational, academic, and preliminary research purposes. It does not provide medical advice, diagnosis, treatment recommendations, prescriptions, or clinical decision support.
              </p>
              <p>
                The founder and developer is a software creator, not a licensed physician, pharmacist, or other qualified healthcare professional. The tool was developed with technical guidance and assistance from AI tools, including ChatGPT and Google Gemini. Neither the founder nor these tools should be treated as a medical authority.
              </p>
              <p className="font-semibold text-slate-900 bg-amber-50 p-3 rounded-lg border border-amber-200">
                Do not use Repurpose to make decisions about your health, medication, dosage, treatment, or patient care. Always verify findings with original scientific literature, regulatory sources, and qualified healthcare professionals.
              </p>
            </div>
          </section>

          {/* Section 2: Information sources and accuracy */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-700" />
              Information sources and accuracy
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Drug and research information displayed in Repurpose is retrieved directly from the external biomedical APIs and public sources listed on the Sources page, which may include RxNorm, openFDA/DailyMed, PubChem, ClinicalTrials.gov, and PubMed.
              </p>
              <p>
                Repurpose does not claim ownership of this information and does not maintain a proprietary medical database. Information may be incomplete, delayed, changed, unavailable, incorrectly mapped, or interpreted differently by its original source.
              </p>
              <p>
                An investigational indication, clinical trial, evidence score, or research reference does not mean that a drug is approved, safe, effective, or recommended for that condition. Users are responsible for independently verifying every result with the original source.
              </p>
              <p className="pt-1">
                <Link
                  href="/sources"
                  className="font-medium text-teal-800 hover:text-teal-950 hover:underline"
                >
                  Source
                </Link>
              </p>
            </div>
          </section>

          {/* Section 3: Privacy */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-700" />
              Privacy
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Repurpose is designed to retrieve biomedical information from the relevant public API sources when a user searches for a drug. The developer does not sell, rent, or intentionally share user search activity or personal information.
              </p>
              <p className="font-semibold text-red-950 bg-red-50 p-3 rounded-lg border border-red-200">
                Please do not submit patient-identifiable information, medical records, prescriptions, health histories, or confidential clinical data through this tool.
              </p>
              <p>
                Third-party services, hosting providers, and upstream biomedical APIs may process limited technical information required to deliver their services, such as IP address, browser type, request time, and search request metadata, according to their own policies. Repurpose has no control over the privacy practices, availability, or content of third-party services.
              </p>
            </div>
          </section>

          {/* Section 4: External links */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-teal-700" />
              External links
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Repurpose may link to external biomedical databases, publications, clinical-trial records, and regulatory resources. These websites operate independently. Repurpose is not responsible for their content, accuracy, availability, security, or privacy practices.
            </p>
            <p className="pt-1">
              <Link
                href="/sources"
                className="text-xs sm:text-sm font-medium text-teal-800 hover:text-teal-950 hover:underline"
              >
                Source
              </Link>
            </p>
          </section>

          {/* Section 5: Limitation of liability */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-700" />
              Limitation of liability
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Use Repurpose at your own risk. To the fullest extent permitted by applicable law, the founder and contributors are not liable for any loss, harm, clinical decision, research outcome, or action taken based on information displayed by this tool.
            </p>
          </section>

          {/* Section 6: Changes to this policy */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-700" />
              Changes to this policy
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              This page may be updated as Repurpose evolves. Continued use of the tool after an update means you accept the revised Terms, Privacy &amp; Research Disclaimer.
            </p>
          </section>

          {/* Section 7: Contact and open source */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-700" />
              Contact and open source
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">For questions, corrections, or concerns, contact:</span>
                <a
                  href="mailto:hello@rahulchakradhar.dev"
                  className="font-medium text-teal-800 hover:text-teal-950 hover:underline font-mono"
                >
                  hello@rahulchakradhar.dev
                </a>
              </div>
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <p className="text-slate-700">
                  Repurpose is an open-source project. View the source code and contribute on GitHub:
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Code2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <a
                    href="https://github.com/rahulchakradhar30/Repurpose"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    Click here for Github Repository
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Navigation Links */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to About &amp; Privacy
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
