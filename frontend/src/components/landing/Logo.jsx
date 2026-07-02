import React from 'react';

export default function Logo({ className = 'w-8 h-8', ...props }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        {/* Premium linear gradient using dynamic theme parameters */}
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--logo-grad-start, #a855f7)" />
          <stop offset="100%" stopColor="var(--logo-grad-end, #6366f1)" />
        </linearGradient>
      </defs>

      {/* Ambient background glow behind the logo core */}
      <circle
        cx="50"
        cy="50"
        r="15"
        fill="url(#logo-grad)"
        opacity="0.15"
      />

      {/* Main Stream 1 - Outer High-Speed Loop */}
      <path
        d="M 15 50 C 15 22, 40 18, 50 50 C 60 82, 85 78, 85 50 C 85 22, 60 18, 50 50 C 40 82, 15 78, 15 50 Z"
        stroke="url(#logo-grad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Parallel Stream 2 - Inner Speed Wave */}
      <path
        d="M 24 50 C 24 30, 42 26, 50 50 C 58 74, 76 70, 76 50 C 76 30, 58 26, 50 50 C 42 74, 24 70, 24 50 Z"
        stroke="url(#logo-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />

      {/* Central "Insight Star" Node */}
      <path
        d="M 50 37 L 52.5 47.5 L 63 50 L 52.5 52.5 L 50 63 L 47.5 52.5 L 37 50 L 47.5 47.5 Z"
        fill="url(#logo-grad)"
      />
    </svg>
  );
}
