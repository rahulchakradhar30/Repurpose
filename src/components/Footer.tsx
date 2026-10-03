'use client';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-100 pt-1.5 pb-14 sm:py-2 text-center text-[9.5px] sm:text-[10px] text-slate-400 bg-white no-print">
      <div className="max-w-4xl mx-auto px-4">
        <p className="text-[9.5px] sm:text-[10px] text-slate-400">
          Contact:{' '}
          <a
            href="mailto:rahulchakradhar30@outlook.com"
            className="font-medium text-teal-800 hover:text-teal-900 hover:underline font-mono text-[9px] sm:text-[9.5px]"
          >
            rahulchakradhar30@outlook.com
          </a>
        </p>
      </div>
    </footer>
  );
}


