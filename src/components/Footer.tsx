'use client';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-100 pt-2 pb-16 sm:py-2.5 text-center text-xs text-slate-500 bg-white no-print">
      <div className="max-w-4xl mx-auto px-4">
        <p className="text-[11px] sm:text-xs text-slate-500">
          Contact:{' '}
          <a
            href="mailto:rahulchakradhar30@outlook.com"
            className="font-medium text-teal-800 hover:text-teal-900 hover:underline font-mono"
          >
            rahulchakradhar30@outlook.com
          </a>
        </p>
      </div>
    </footer>
  );
}

