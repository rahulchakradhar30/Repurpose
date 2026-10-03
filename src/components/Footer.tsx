'use client';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-100 pt-1 pb-14 sm:py-1.5 text-center text-[8.5px] sm:text-[9px] text-slate-400 bg-white no-print">
      <div className="max-w-4xl mx-auto px-4">
        <p className="text-[8.5px] sm:text-[9px] text-slate-400 tracking-tight">
          <span>Contact:</span>{' '}
          <a
            href="mailto:rahulchakradhar30@outlook.com"
            className="font-medium text-teal-800 hover:text-teal-900 hover:underline font-mono text-[8.5px] sm:text-[9px]"
          >
            rahulchakradhar30@outlook.com
          </a>
        </p>
      </div>
    </footer>
  );
}



