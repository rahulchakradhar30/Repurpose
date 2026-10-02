'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface CopyPageLinkButtonProps {
  label?: string;
  className?: string;
}

export function CopyPageLinkButton({ label = 'Copy link', className = '' }: CopyPageLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy URL to clipboard:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        copied
          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
          : 'bg-slate-800/80 text-slate-300 border border-slate-700/60 hover:bg-slate-700/80 hover:text-white'
      } ${className}`}
      title="Copy link to clipboard"
      aria-label="Copy link to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
      <span>{copied ? 'Copied link' : label}</span>
    </button>
  );
}
