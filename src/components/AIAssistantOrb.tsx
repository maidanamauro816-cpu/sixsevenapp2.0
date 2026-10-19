import React from 'react';

/**
 * SixSeven's custom AI orb. This is deliberately an abstract eye/orb,
 * not a robot face. Tapping it opens the full SixSeven IA assistant.
 */
interface AIAssistantOrbProps {
  onClick: () => void;
  compact?: boolean;
}

export const AIAssistantOrb: React.FC<AIAssistantOrbProps> = ({ onClick, compact = false }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Abrir SixSeven IA"
    title="SixSeven IA"
    className={`sx-ai-orb relative flex shrink-0 items-center justify-center rounded-full bg-black border border-[#ff1a1a] ${compact ? 'w-[42px] h-[42px]' : 'w-[48px] h-[48px]'}`}
  >
    <span className="sx-ai-orb-halo absolute inset-[-5px] rounded-full pointer-events-none" />
    <svg viewBox="0 0 48 48" aria-hidden="true" className="relative z-10 w-[78%] h-[78%]">
      <defs>
        <radialGradient id="sx-orb-iris" cx="38%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#ff4545" />
          <stop offset="48%" stopColor="#8d0710" />
          <stop offset="100%" stopColor="#210004" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="18" fill="#080808" stroke="#ff1a1a" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="12.5" fill="url(#sx-orb-iris)" stroke="#b20b18" strokeWidth="1" />
      <g stroke="#160003" strokeWidth="1.2" strokeLinecap="round" opacity=".9">
        <path d="M24 12.5v5" /><path d="M24 30.5v5" />
        <path d="M12.5 24h5" /><path d="M30.5 24h5" />
        <path d="m15.8 15.8 3.6 3.6" /><path d="m28.6 28.6 3.6 3.6" />
        <path d="m32.2 15.8-3.6 3.6" /><path d="m19.4 28.6-3.6 3.6" />
      </g>
      <circle cx="24" cy="24" r="6.2" fill="#020202" stroke="#41050a" strokeWidth="1" />
      <circle cx="20.2" cy="18.7" r="2.1" fill="#fff" opacity=".95" />
      <circle cx="29.8" cy="29.5" r="1" fill="#ffb4b4" opacity=".8" />
    </svg>
    <style>{`
      .sx-ai-orb { box-shadow: 0 0 10px rgba(255,26,26,.28), inset 0 0 12px rgba(255,26,26,.08); transition: transform .18s ease, box-shadow .18s ease; }
      .sx-ai-orb:hover { transform: scale(1.04); box-shadow: 0 0 18px rgba(255,26,26,.55), inset 0 0 14px rgba(255,26,26,.12); }
      .sx-ai-orb-halo { border: 1px solid rgba(255,26,26,.24); box-shadow: 0 0 14px rgba(255,26,26,.18); animation: sx-orb-pulse 3s ease-in-out infinite; }
      @keyframes sx-orb-pulse { 0%,100% { opacity:.35; transform:scale(.96); } 50% { opacity:.85; transform:scale(1.06); } }
      @media (prefers-reduced-motion: reduce) { .sx-ai-orb-halo { animation:none; } }
    `}</style>
  </button>
);
