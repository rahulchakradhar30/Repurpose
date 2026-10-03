import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, Mail, Lock, Code2, HeartHandshake, ArrowRight } from 'lucide-react';
import { generateBreadcrumbJsonLd, getCanonicalUrl, SITE_CONFIG } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'About Repurpose | Mission, Privacy & Creator Attribution',
  description:
    'Repurpose is an open-source, evidence-grounded research tool built to help pharmacy students and biomedical investigators explore drug repositioning candidates.',
  alternates: {
    canonical: getCanonicalUrl('/about'),
  },
  openGraph: {
    title: 'About Repurpose & Project Principles',
    description:
      'Learn about the mission, safety guardrails, privacy guarantees, and open-source architecture powering Repurpose.',
    url: getCanonicalUrl('/about'),
    type: 'website',
  },
};

export default function AboutPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
  ]);

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_CONFIG.creator.name,
    email: SITE_CONFIG.creator.contactEmail,
  };

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Repurpose',
    description: 'Mission, privacy commitments, open-source architecture, and creator information for Repurpose.',
    url: getCanonicalUrl('/about'),
    publisher: personJsonLd,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <div className="flex-1 flex flex-col pb-16 md:pb-6 text-slate-900">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full">
          {/* Breadcrumb Navigation */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center text-xs text-slate-500 gap-2">
              <li><Link href="/" className="hover:text-teal-800 transition-colors">Home</Link></li>
              <li>/</li>
              <li className="text-slate-800 font-semibold">About &amp; Privacy</li>
            </ol>
          </nav>

          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <HeartHandshake className="w-3.5 h-3.5" />
              Open-Source Project Principles
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3 font-heading">
              About Repurpose
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Repurpose was created as a transparent, high-integrity educational reference tool for pharmacy students, pharmacology trainees, and translational biomedical researchers exploring the science of drug repurposing.
            </p>
          </div>

          {/* Mission Statement */}
          <section className="mb-8 p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Code2 className="w-5 h-5 text-teal-700" />
              Project Mission
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              Discovering new therapeutic indications for existing molecules has historically required combing through disconnected databases—clinical trial registries, molecular pharmacology databases, drug product labels, and peer-reviewed MEDLINE articles.
            </p>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              Repurpose synthesizes these disjointed public sources into a unified, evidence-graded dossier in real time. We strictly reject the industry practice of generating plausible-sounding medical claims with unconstrained large language models. In this application, every single data point must map directly to an authoritative public record.
            </p>
          </section>

          {/* Research-Only Medical Disclaimer */}
          <section className="mb-8 p-5 rounded-xl bg-amber-50 border-2 border-amber-300">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-amber-950 mb-1.5">
                  Educational & Research-Support Notice (Not Medical Advice)
                </h2>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                  Repurpose is an informational and computational reference platform designed solely for educational, academic, and scientific exploration. 
                  <strong className="text-amber-950"> This platform does not provide medical advice, diagnosis, treatment recommendations, or clinical prescribing guidance.</strong>
                </p>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed mt-2">
                  Repurposing investigations in preclinical stages or early-phase trials may have unknown toxicity, unverified efficacy, or severe contraindications. Patients must consult licensed healthcare professionals regarding any medical condition or pharmacological therapy.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy & Zero-Tracking Guarantee */}
          <section className="mb-8 p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-700" />
              Privacy Architecture & Zero-Data Retention
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              We believe research tools should respect investigator privacy without tracking queries or demanding personal information:
            </p>
            <ul className="text-xs sm:text-sm text-slate-700 space-y-2 list-disc pl-5">
              <li><strong className="text-slate-900">No User Accounts or Logins:</strong> Repurpose is entirely open and read-only. No sign-up, password, or profile is required or supported.</li>
              <li><strong className="text-slate-900">No Tracking Cookies or Ad Pixels:</strong> We do not deploy third-party trackers, advertising beacons, or behavioural profiling scripts.</li>
              <li><strong className="text-slate-900">URL Sharing Without Storing Queries:</strong> When you copy a link to share research, the state is conveyed safely through the URL route without storing user sessions on a server.</li>
              <li><strong className="text-slate-900">Source API Confidentiality:</strong> Queries dispatched to government APIs (RxNorm, openFDA, PubChem, ClinicalTrials.gov) contain only the public compound identifier being researched.</li>
            </ul>
          </section>

          {/* Creator Attribution */}
          <section className="mb-10 p-6 rounded-xl bg-white border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Creator Attribution & Contact</h2>
            <p className="text-sm text-slate-700 leading-relaxed mb-3">
              Open-source tool prepared by <strong className="text-slate-900">P. Rahul Chakradhar</strong>.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Developed as an independent open-science contribution to computational pharmacology education. The project creator does not make clinical claims or claim personal medical credentials. Suggestions, data discrepancies, or bug reports are welcomed via email.
            </p>
            <div className="flex items-center gap-2 text-sm text-teal-800">
              <Mail className="w-4 h-4 text-teal-700" />
              <span className="text-slate-600">Contact:</span>
              <a
                href="mailto:rahulchakradhar30@outlook.com"
                className="font-medium text-teal-800 hover:text-teal-900 hover:underline font-mono text-xs sm:text-sm"
              >
                rahulchakradhar30@outlook.com
              </a>
            </div>
          </section>

          {/* Educational Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <Link
              href="/what-is-drug-repurposing"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-600 hover:shadow-xs transition-all group"
            >
              <div className="text-xs text-teal-800 font-mono font-medium mb-1">Educational Guide</div>
              <div className="text-sm font-bold text-slate-900 group-hover:text-teal-800 flex items-center justify-between">
                What is Drug Repurposing?
                <ArrowRight className="w-4 h-4 ml-1 text-slate-400 group-hover:text-teal-800" />
              </div>
            </Link>
            <Link
              href="/sources"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-600 hover:shadow-xs transition-all group"
            >
              <div className="text-xs text-teal-800 font-mono font-medium mb-1">Registry Documentation</div>
              <div className="text-sm font-bold text-slate-900 group-hover:text-teal-800 flex items-center justify-between">
                View Verified Data Sources
                <ArrowRight className="w-4 h-4 ml-1 text-slate-400 group-hover:text-teal-800" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
