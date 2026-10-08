import React from 'react';

interface MicroscopeWatermarkProps {
  className?: string;
}

export function MicroscopeWatermark({ className = '' }: MicroscopeWatermarkProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none flex flex-col items-center justify-center py-6 sm:py-10 transition-opacity duration-300 ${className}`}
    >
      <svg
        viewBox="0 0 280 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-48 h-48 sm:w-60 sm:h-60 text-teal-800/25 dark:text-teal-500/25"
      >
        {/* Subtle Molecular Ring & Bond Watermark Accents */}
        <g stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6">
          <circle cx="210" cy="70" r="28" />
          <path d="M210 42 L234 56 L234 84 L210 98 L186 84 L186 56 Z" />
          <line x1="210" y1="42" x2="210" y2="26" />
          <line x1="234" y1="84" x2="248" y2="92" />
        </g>

        {/* Floating Molecule / Chemical Bonds around stage */}
        <g stroke="currentColor" strokeWidth="1.5" opacity="0.7">
          <circle cx="68" cy="180" r="4" fill="currentColor" />
          <circle cx="50" cy="195" r="3" fill="currentColor" />
          <circle cx="82" cy="200" r="3.5" fill="currentColor" />
          <line x1="68" y1="180" x2="50" y2="195" />
          <line x1="68" y1="180" x2="82" y2="200" />
        </g>

        {/* Optical Light Beam Cone (Sub-stage condenser to objective lens) */}
        <path
          d="M136 210 L124 135 L156 135 L144 210 Z"
          fill="currentColor"
          opacity="0.15"
        />

        {/* Microscope Base */}
        <path
          d="M70 248 C70 236 85 232 105 232 L175 232 C195 232 210 236 210 248 C210 252 205 256 195 256 L85 256 C75 256 70 252 70 248 Z"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M75 248 C75 240 88 236 105 236 L175 236 C192 236 205 240 205 248"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M85 256 L195 256"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Microscope Light Source / Substage Illuminator */}
        <rect
          x="126"
          y="212"
          width="28"
          height="14"
          rx="3"
          fill="currentColor"
          opacity="0.4"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line x1="140" y1="226" x2="140" y2="234" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />

        {/* Microscope Pillar & Curved Arm */}
        <path
          d="M175 234 L175 190 C175 135 215 110 205 65 C198 35 165 42 145 55"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.35"
        />
        <path
          d="M175 234 L175 190 C175 135 215 110 205 65 C198 35 165 42 145 55"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Coarse & Fine Focus Adjustment Knobs */}
        <circle cx="184" cy="148" r="13" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="184" cy="148" r="6" fill="currentColor" opacity="0.6" stroke="currentColor" strokeWidth="1.5" />
        <line x1="184" y1="135" x2="184" y2="161" stroke="currentColor" strokeWidth="1.5" />
        <line x1="171" y1="148" x2="197" y2="148" stroke="currentColor" strokeWidth="1.5" />

        {/* Eyepiece / Ocular Lens & Tube */}
        <g transform="rotate(-30 115 50)">
          {/* Eyepiece Cap */}
          <rect x="92" y="10" width="26" height="8" rx="2" fill="currentColor" opacity="0.5" stroke="currentColor" strokeWidth="2" />
          {/* Ocular Drawtube */}
          <rect x="96" y="18" width="18" height="38" rx="1" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2" />
          {/* Head Body */}
          <rect x="90" y="56" width="30" height="24" rx="4" fill="currentColor" opacity="0.4" stroke="currentColor" strokeWidth="2" />
        </g>

        {/* Revolving Nosepiece / Turret */}
        <path
          d="M120 98 C120 90 160 90 160 98 L155 106 C155 110 125 110 125 106 Z"
          fill="currentColor"
          opacity="0.5"
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* Multiple Objective Lenses */}
        {/* Active Central Lens (Examining the drug) */}
        <path
          d="M134 108 L133 130 L147 130 L146 108 Z"
          fill="currentColor"
          opacity="0.6"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect x="131" y="128" width="18" height="4" rx="1" fill="currentColor" stroke="currentColor" strokeWidth="1" />
        <line x1="133" y1="118" x2="147" y2="118" stroke="currentColor" strokeWidth="1.5" />

        {/* Angled Inactive Left Lens */}
        <path
          d="M126 108 L114 126 L124 132 L132 110 Z"
          fill="currentColor"
          opacity="0.3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Angled Inactive Right Lens */}
        <path
          d="M154 108 L166 126 L156 132 L148 110 Z"
          fill="currentColor"
          opacity="0.3"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* Mechanical Stage Platform */}
        <rect
          x="92"
          y="150"
          width="96"
          height="8"
          rx="2"
          fill="currentColor"
          opacity="0.5"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* Stage Slide Clips */}
        <path d="M102 150 L102 144 L114 144" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M178 150 L178 144 L166 144" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

        {/* Glass Specimen Slide */}
        <rect
          x="110"
          y="144"
          width="60"
          height="6"
          rx="1"
          fill="currentColor"
          opacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* DRUG CAPSULE BEING EXAMINED UNDER THE OBJECTIVE LENS */}
        <g transform="translate(140, 140) rotate(-15)">
          {/* Left half of capsule (filled) */}
          <path
            d="M-14 -5 C-18 -5 -21 -2 -21 2 C-21 6 -18 9 -14 9 L-2 9 L-2 -5 Z"
            fill="currentColor"
            opacity="0.8"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {/* Right half of capsule (hollow / transparent with drug active beads) */}
          <path
            d="M-2 -5 L10 -5 C14 -5 17 -2 17 2 C17 6 14 9 10 9 L-2 9 Z"
            fill="currentColor"
            opacity="0.25"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {/* Capsule Center Joint Band */}
          <line x1="-2" y1="-5" x2="-2" y2="9" stroke="currentColor" strokeWidth="2" />
          {/* Micro active drug particles inside capsule */}
          <circle cx="3" cy="0" r="1" fill="currentColor" />
          <circle cx="8" cy="4" r="1" fill="currentColor" />
          <circle cx="11" cy="-1" r="0.9" fill="currentColor" />
          <circle cx="5" cy="5" r="0.8" fill="currentColor" />
        </g>

        {/* Focus Rays / Examination Reticle Sparkles */}
        <g stroke="currentColor" strokeWidth="1" opacity="0.75">
          <line x1="140" y1="133" x2="140" y2="136" strokeLinecap="round" />
          <line x1="130" y1="138" x2="133" y2="139" strokeLinecap="round" />
          <line x1="150" y1="138" x2="147" y2="139" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
