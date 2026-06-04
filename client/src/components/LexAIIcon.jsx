import React from 'react'

export default function LexAIIcon({ size = 40, className = '', title = 'LexAI' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id="lexai-gradient" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="60" height="60" rx="18" fill="#0F0F23" />

      <path
        d="M20 41h24"
        stroke="url(#lexai-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M22 41V27m20 14V27M18 27h8m12 0h8"
        stroke="url(#lexai-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M26 27l6-9 6 9"
        stroke="url(#lexai-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="32" cy="18" r="2.4" fill="url(#lexai-gradient)" />
      <circle cx="18" cy="27" r="1.9" fill="url(#lexai-gradient)" />
      <circle cx="46" cy="27" r="1.9" fill="url(#lexai-gradient)" />

      <path
        d="M49 15l1.3 3.2L54 19.5l-3.7 1.3L49 24l-1.3-3.2-3.7-1.3 3.7-1.3L49 15Z"
        fill="url(#lexai-gradient)"
      />
    </svg>
  )
}
