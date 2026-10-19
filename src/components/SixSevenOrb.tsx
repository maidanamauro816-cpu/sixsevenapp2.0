import React from 'react';

interface SixSevenOrbProps {
  size?: number;
  className?: string;
  listening?: boolean;
  label?: string;
}

/** Orbe ocular original de SixSeven: esfera negra, iris rojo oscuro y aro rojo neón. */
export const SixSevenOrb: React.FC<SixSevenOrbProps> = ({
  size = 52,
  className = '',
  listening = false,
  label = 'Orbe de SixSeven IA',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    role="img"
    aria-label={label}
    className={`sx-sixseven-orb ${listening ? 'sx-orb-listening' : ''} ${className}`}
    style={{ flex: '0 0 auto', overflow: 'visible' }}
  >
    <defs>
      <radialGradient id="sx-orb-glass" cx="35%" cy="28%" r="75%">
        <stop offset="0%" stopColor="#171717" />
        <stop offset="62%" stopColor="#050505" />
        <stop offset="100%" stopColor="#000000" />
      </radialGradient>
      <radialGradient id="sx-orb-iris" cx="38%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#7d101b" />
        <stop offset="58%" stopColor="#39070d" />
        <stop offset="100%" stopColor="#130205" />
      </radialGradient>
      <filter id="sx-orb-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="3.4" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <clipPath id="sx-orb-clip"><circle cx="50" cy="50" r="45" /></clipPath>
    </defs>
    <circle cx="50" cy="50" r="47" fill="#000" stroke="#ff1a1a" strokeWidth="2.2" filter="url(#sx-orb-glow)" />
    <circle cx="50" cy="50" r="43.5" fill="url(#sx-orb-glass)" stroke="#631018" strokeWidth="1.2" />
    <g clipPath="url(#sx-orb-clip)">
      <circle cx="50" cy="50" r="34" fill="#070707" stroke="#29070b" strokeWidth="1.2" />
      <g className="sx-orb-gaze">
        <circle cx="50" cy="50" r="27" fill="url(#sx-orb-iris)" stroke="#a01622" strokeWidth="1.2" />
        <g stroke="#050505" strokeWidth="2.1" strokeLinecap="round" opacity=".94">
          <path d="M50 25 L50 34" /><path d="M62 28 L58 36" />
          <path d="M72 39 L63 43" /><path d="M75 51 L65 51" />
          <path d="M69 64 L61 60" /><path d="M59 73 L56 64" />
          <path d="M46 76 L47 66" /><path d="M34 70 L39 61" />
          <path d="M26 59 L36 56" /><path d="M25 45 L36 46" />
          <path d="M31 33 L39 39" /><path d="M41 25 L44 35" />
        </g>
        <circle cx="50" cy="50" r="14.5" fill="#000" stroke="#160205" strokeWidth="2" />
        <circle cx="45.5" cy="43.5" r="4.4" fill="#fff" opacity=".94" />
        <circle cx="56.5" cy="57" r="2" fill="#ff4754" opacity=".6" />
      </g>
      <ellipse cx="34" cy="24" rx="11" ry="4" fill="#fff" opacity=".055" transform="rotate(-32 34 24)" />
    </g>
    <circle cx="50" cy="50" r="46" fill="none" stroke="#ff4a54" strokeWidth=".7" opacity=".9" />
  </svg>
);
