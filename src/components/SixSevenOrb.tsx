import React from 'react';

interface SixSevenOrbProps {
  size?: number;
  className?: string;
  listening?: boolean;
  label?: string;
}

/** Identidad oficial SixSeven: S blanca/roja, fondo negro y aro neón rojo. */
export const SixSevenOrb: React.FC<SixSevenOrbProps> = ({
  size = 52,
  className = '',
  listening = false,
  label = 'SixSeven IA',
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label}
    className={`sx-sixseven-orb ${listening ? 'sx-orb-listening' : ''} ${className}`}
    style={{ flex: '0 0 auto', overflow: 'visible' }}>
    <defs>
      <filter id="sx-logo-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.8" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <linearGradient id="sx-logo-s" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#ff2736" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="47" fill="#000" stroke="#ff1725" strokeWidth="2.8" filter="url(#sx-logo-glow)" />
    <circle cx="50" cy="50" r="41.5" fill="#030303" stroke="#641019" strokeWidth="1" />
    <path d="M72 28c-6.2-5.2-13.8-8-22.3-8-16.6 0-27.8 8.7-27.8 21.8 0 11.8 9 17.2 26.2 21 12.1 2.7 16.1 5.1 16.1 9.9 0 5.3-5.5 8.6-14.1 8.6-9.5 0-17.7-3.5-24.5-10.4l-9.5 11.7c8.6 8.6 20.7 13.4 34 13.4 17.7 0 29.6-8.6 29.6-23.1 0-12.1-7.9-17.4-25.3-21.6-13-3.1-17.2-5.1-17.2-9.5 0-4.2 4.6-7 11.9-7 7.1 0 13.2 2.2 19.2 6.8z"
      transform="translate(0 -3) scale(1 .94)" fill="url(#sx-logo-s)" filter="url(#sx-logo-glow)" />
  </svg>
);
