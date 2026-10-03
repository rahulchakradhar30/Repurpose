'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname() || '/';
  
  // Creator details only visible on Explore (/), About (/about), and Methodology (/methodology)
  const showCreatorDetails = pathname === '/' || pathname === '/about' || pathname === '/methodology';

  return (
    <footer className="mt-auto border-t border-slate-100 py-2.5 sm:py-3 text-center text-[10px] text-slate-400 bg-white no-print">
      <div className="max-w-4xl mx-auto px-4 space-y-1.5">
        <div className="flex flex-wrap items-center justify-center gap-2 text-slate-500 font-medium text-[10px]">
          <Link href="/" className="hover:text-teal-800 transition-colors">
            Explore
          </Link>
          <span className="text-slate-200">·</span>
          <Link href="/compare" className="hover:text-teal-800 transition-colors">
            Compare
          </Link>
          <span className="text-slate-200">·</span>
          <Link href="/notebook" className="hover:text-teal-800 transition-colors">
            Notebook
          </Link>
          <span className="text-slate-200">·</span>
          <Link href="/sources" className="hover:text-teal-800 transition-colors">
            Sources
          </Link>
          <span className="text-slate-200">·</span>
          <Link href="/what-is-drug-repurposing" className="hover:text-teal-800 transition-colors">
            Guide
          </Link>
          <span className="text-slate-200">·</span>
          <Link href="/methodology" className="hover:text-teal-800 transition-colors">
            Methodology
          </Link>
          <span className="text-slate-200">·</span>
          <Link href="/about" className="hover:text-teal-800 transition-colors">
            About &amp; Privacy
          </Link>
        </div>

        {showCreatorDetails && (
          <div className="space-y-0 text-[10px] text-slate-400">
            <p>Open-source tool prepared by P. Rahul Chakradhar</p>
            <p>
              Contact:{' '}
              <a
                href="mailto:rahulchakradhar30@outlook.com"
                className="font-medium text-teal-800 hover:text-teal-900 hover:underline font-mono"
              >
                rahulchakradhar30@outlook.com
              </a>
            </p>
          </div>
        )}

        <p className="text-[9px] text-slate-400/90 max-w-2xl mx-auto leading-normal pt-1 border-t border-slate-100">
          Repurpose is an open-source evidence workspace for investigating drug-repurposing hypotheses through transparent clinical, biological, regulatory, safety, and literature evidence. Strictly for research and education; not medical advice, treatment recommendations, or prescribing guidance.
        </p>
      </div>
    </footer>
  );
}
