import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Scale, 
  ExternalLink, 
  FileCode, 
  ShieldCheck, 
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import { generateBreadcrumbJsonLd, generateArticleJsonLd, getCanonicalUrl, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Open-Source MIT License | Repurpose',
  description:
    'Repurpose is open-source software released under the MIT License. View source code usage permissions, copyright terms, and liability limits.',
  keywords: [
    'MIT License',
    'Open Source Drug Repurposing',
    'Biomedical Software License',
    'Repurpose Source Code',
    'P. Rahul Chakradhar'
  ],
  alternates: {
    canonical: getCanonicalUrl('/license'),
  },
  openGraph: {
    title: 'Open-Source MIT License | Repurpose',
    description:
      'Repurpose open-source software licensing terms, MIT License permissions, and source code copyright notice.',
    url: getCanonicalUrl('/license'),
    siteName: SITE_NAME,
    type: 'article',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Open-Source MIT License | Repurpose',
    description:
      'Repurpose open-source software licensing terms, MIT License permissions, and source code copyright notice.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LicensePage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Workspace', url: '/' },
    { name: 'About & Privacy', url: '/about' },
    { name: 'Open-Source License', url: '/license' },
  ]);

  const articleJsonLd = generateArticleJsonLd({
    headline: 'Terms, Privacy & MIT License | Repurpose',
    description:
      'Official MIT License terms, source code permissions, and liability disclaimers for the open-source Repurpose platform.',
    path: '/license',
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex-1 w-full">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 no-print h-5">
            <Link href="/" className="hover:text-teal-800 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
            <span>/</span>
            <Link href="/about" className="hover:text-teal-800 transition-colors">
              About &amp; Privacy
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate">
              Open-Source License
            </span>
          </nav>

          {/* Header */}
          <div className="space-y-2 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-600 tracking-wide font-mono">
              <FileCode className="w-3.5 h-3.5 text-red-600" />
              <span>MIT Open-Source Software</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-red-600 font-heading">
              Open-Source License
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Last updated: October 8, 2026
            </p>
          </div>

          {/* Core MIT License Summary Card */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p className="font-medium text-slate-900 text-sm sm:text-base">
                Repurpose is open-source software released under the MIT License.
              </p>

              <p className="font-mono text-xs text-slate-800 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                Copyright &copy; 2026 P. Rahul Chakradhar.
              </p>

              <p>
                The MIT License permits any person to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the Repurpose software, provided that the original copyright notice and MIT License notice are included in all substantial copies of the software.
              </p>

              <p>
                The software is provided &ldquo;as is&rdquo;, without warranty of any kind, express or implied. The founder, contributors, and copyright holders are not liable for claims, damages, or other liability arising from the software or its use.
              </p>

              <p>
                This license applies only to the Repurpose source code. It does not grant ownership of, or rights over, third-party biomedical information, medical databases, publications, trademarks, APIs, or external resources accessed through the platform. These remain subject to the terms and policies of their respective owners.
              </p>

              <p className="font-medium text-slate-900 pt-1">
                Repurpose remains an educational and research tool only. The MIT License does not change the medical, research, privacy, or liability disclaimers on this page.
              </p>
            </div>

            {/* Outlined GitHub License Button */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/rahulchakradhar30/Repurpose/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400 text-xs sm:text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-teal-500 cursor-pointer"
              >
                <span>View MIT License on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
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

            <Link
              href="/terms-privacy-disclaimer"
              className="text-xs font-semibold text-slate-600 hover:text-teal-800 transition-colors underline"
            >
              Terms, Privacy &amp; Research Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
