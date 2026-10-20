import React, { useRef, useState } from 'react';

interface SixSevenOrbProps {
  size?: number;
  className?: string;
  listening?: boolean;
  label?: string;
}

/** Orbe de IA: ojo carmesí animado. El logotipo oficial SX/S se mantiene separado. */
export const SixSevenOrb: React.FC<SixSevenOrbProps> = ({
  size = 52,
  className = '',
  listening = false,
  label = 'Ojo de SixSeven IA',
}) => {
  const eyeRef = useRef<SVGSVGElement>(null);
  const [gaze, setGaze] = useState({ x: 50, y: 50 });
  const followPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / Math.max(1, bounds.width);
    const py = (event.clientY - bounds.top) / Math.max(1, bounds.height);
    setGaze({ x: 50 + Math.max(-1, Math.min(1, (px - .5) * 2)) * 5.5, y: 50 + Math.max(-1, Math.min(1, (py - .5) * 2)) * 4 });
  };
  return (
    <svg ref={eyeRef} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label}
      onPointerMove={followPointer} onPointerLeave={() => setGaze({ x: 50, y: 50 })}
      className={`sx-sixseven-orb sx-eye-orb ${listening ? 'sx-orb-listening' : ''} ${className}`}
      style={{ flex: '0 0 auto', overflow: 'visible', touchAction: 'pan-y' }}>
      <defs>
        <filter id="sx-eye-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="sx-eye-iris" cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#ffb4b4" />
          <stop offset="28%" stopColor="#ff333f" />
          <stop offset="62%" stopColor="#a60012" />
          <stop offset="100%" stopColor="#170006" />
        </radialGradient>
        <clipPath id="sx-eye-clip"><circle cx="50" cy="50" r="39" /></clipPath>
      </defs>
      <circle cx="50" cy="50" r="47" fill="#020202" stroke="#ff1725" strokeWidth="2.8" filter="url(#sx-eye-glow)" />
      <circle cx="50" cy="50" r="41.5" fill="#050505" stroke="#641019" strokeWidth="1.2" />
      <g clipPath="url(#sx-eye-clip)">
        <path d="M7 50 Q50 7 93 50 Q50 93 7 50Z" fill="#1a0005" stroke="#ff2637" strokeWidth="2.5" />
        <ellipse cx={gaze.x} cy={gaze.y} rx="24" ry="25" fill="url(#sx-eye-iris)" stroke="#ff4a55" strokeWidth="1.4" />
        <circle cx={gaze.x} cy={gaze.y} r="15.5" fill="#230006" stroke="#ff6b74" strokeWidth="1.1" />
        <circle cx={gaze.x} cy={gaze.y} r="8.5" fill="#020202" />
        <circle cx={gaze.x - 7} cy={gaze.y - 9} r="4.2" fill="#fff0f0" opacity=".9" />
        <circle cx={gaze.x + 8} cy={gaze.y + 7} r="2" fill="#ffb1b6" />
        <path d="M8 49 Q50 8 92 49" fill="none" stroke="#ff4550" strokeWidth="1.4" opacity=".9" />
        <path d="M8 51 Q50 92 92 51" fill="none" stroke="#b20b1a" strokeWidth="1.8" />
      </g>
      <path className="sx-eye-blink" d="M10 50 Q50 5 90 50 Q50 95 10 50Z" fill="#020202" />
      <circle cx="50" cy="50" r="46.5" fill="none" stroke="#ff2736" strokeWidth="1.2" strokeDasharray="5 8" className="sx-eye-ring" />
    </svg>
  );
};
