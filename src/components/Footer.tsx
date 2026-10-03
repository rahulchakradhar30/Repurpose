import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white no-print">
      <div className="max-w-5xl mx-auto px-4 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-3 text-slate-600 font-medium">
          <Link href="/" className="hover:text-teal-800 transition-colors">
            Explore
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/compare" className="hover:text-teal-800 transition-colors">
            Compare
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/notebook" className="hover:text-teal-800 transition-colors">
            Notebook
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/sources" className="hover:text-teal-800 transition-colors">
            Sources
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/what-is-drug-repurposing" className="hover:text-teal-800 transition-colors">
            Guide
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/methodology" className="hover:text-teal-800 transition-colors">
            Methodology
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/about" className="hover:text-teal-800 transition-colors">
            About &amp; Privacy
          </Link>
        </div>
        <p className="text-slate-500 text-xs">
          Open-source tool prepared by P. Rahul Chakradhar · Contact:{' '}
          <a
            href="mailto:rahulchakradhar30@outlook.com"
            className="font-medium text-teal-800 hover:text-teal-900 hover:underline font-mono"
          >
            rahulchakradhar30@outlook.com
          </a>
        </p>
        <p className="text-[11px] text-slate-400 max-w-3xl mx-auto leading-relaxed pt-2 border-t border-slate-100">
          Repurpose is an open-source evidence workspace for investigating drug-repurposing hypotheses through transparent clinical, biological, regulatory, safety, and literature evidence. Strictly for research and education; not medical advice, treatment recommendations, or prescribing guidance.
        </p>
      </div>
    </footer>
  );
}
