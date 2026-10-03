'use client';

import React from 'react';
import { Printer } from 'lucide-react';

interface PrintSummaryButtonProps {
  label?: string;
  className?: string;
  variant?: 'outline' | 'ghost' | 'teal';
}

export function PrintSummaryButton({
  label = 'Print Summary',
  className = '',
  variant = 'outline',
}: PrintSummaryButtonProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const variantStyles = {
    outline: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 border-transparent',
    teal: 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-300',
  }[variant];

  return (
    <button
      onClick={handlePrint}
      className={`no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer shadow-2xs ${variantStyles} ${className}`}
      title="Print or save as PDF"
      aria-label="Print or save summary as PDF"
    >
      <Printer className="w-3.5 h-3.5 text-blue-700" />
      <span>{label}</span>
    </button>
  );
}
