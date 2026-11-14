import React from 'react';

interface NutriLogoProps {
  compact?: boolean;
  tagline?: string;
}

export const NutriLogo: React.FC<NutriLogoProps> = ({
  compact = false,
  tagline = 'EAT SMART • LIVE HEALTHY.',
}) => {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative shrink-0 w-10 h-10 flex items-center justify-center">
        <svg
          viewBox="0 0 80 80"
          className="w-10 h-10 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="nutriRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="nutriAppleGrad" x1="15%" y1="10%" x2="85%" y2="90%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="52%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          {/* Futuristic circular emblem */}
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="#070d1f"
            stroke="url(#nutriRingGrad)"
            strokeWidth="2.4"
          />
          {/* Planet orbit */}
          <ellipse
            cx="40"
            cy="40"
            rx="37"
            ry="14"
            transform="rotate(-24 40 40)"
            fill="none"
            stroke="#22d3ee"
            strokeOpacity="0.65"
            strokeWidth="1.4"
          />
          <circle cx="71" cy="26" r="2.6" fill="#34d399" />
          {/* Apple silhouette */}
          <path
            d="M40 24c-4.5-3.6-11.5-3.2-15.8 2-5.2 6.2-4.4 18.4 1.2 26.8 3.6 5.4 8 8.8 11.6 8.8 2 0 3-.8 3-.8s1 .8 3 .8c3.6 0 8-3.4 11.6-8.8 5.6-8.4 6.4-20.6 1.2-26.8-4.3-5.2-11.3-5.6-15.8-2z"
            fill="url(#nutriAppleGrad)"
          />
          {/* Apple leaf */}
          <path d="M40.5 19.5c1-4.5 5-7.5 9.5-7-0.5 4.5-4.5 7.5-9.5 7z" fill="#34d399" />
          {/* Fork negative space */}
          <path
            d="M36.5 31v9.5c0 2 1.5 3.6 3 3.9V58h2V44.4c1.5-.3 3-1.9 3-3.9V31h-1.8v7h-1.3v-7h-1.8v7h-1.3v-7h-1.8z"
            fill="#070d1f"
          />
          {/* Glowing AI spark */}
          <path
            d="M57 13l1.6 4.4L63 19l-4.4 1.6L57 25l-1.6-4.4L51 19l4.4-1.6L57 13z"
            fill="#22d3ee"
          />
        </svg>
      </div>

      <div className="min-w-0">
        <div className="font-display text-lg font-extrabold tracking-wider bg-gradient-to-r from-cyan-300 via-violet-300 to-emerald-300 bg-clip-text text-transparent whitespace-nowrap">
          NUTRIAI
        </div>
        {!compact && (
          <div className="text-[10px] tracking-[0.18em] text-slate-400 whitespace-nowrap truncate">
            {tagline}
          </div>
        )}
      </div>
    </div>
  );
};
