import React, { useId, useState } from 'react';

interface SixSevenOrbProps {
  size?: number;
  className?: string;
  listening?: boolean;
  label?: string;
}

/** Orbe exclusivo de SixSeven IA: ojo rojo tecnológico; nunca muestra el logotipo S. */
export const SixSevenOrb: React.FC<SixSevenOrbProps> = ({
  size = 52, className = '', listening = false, label = 'Ojo de SixSeven IA',
}) => {
  const uid = useId().replace(/:/g, '');
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label}
      className={`sx-sixseven-orb sx-ai-eye ${listening ? 'sx-orb-listening' : ''} ${className}`}
      style={{ flex: '0 0 auto', overflow: 'visible', cursor: 'pointer' }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPupil({ x: ((event.clientX - rect.left) / rect.width - .5) * 10,
          y: ((event.clientY - rect.top) / rect.height - .5) * 10 });
      }}
      onPointerLeave={() => setPupil({ x: 0, y: 0 })}>
      <defs>
        <radialGradient id={`sx-glass-${uid}`} cx="28%" cy="20%" r="85%">
          <stop offset="0%" stopColor="#45474d"/><stop offset="42%" stopColor="#111216"/><stop offset="100%" stopColor="#000"/>
        </radialGradient>
        <radialGradient id={`sx-iris-${uid}`}>
          <stop offset="0%" stopColor="#050000"/><stop offset="35%" stopColor="#60000b"/>
          <stop offset="65%" stopColor="#ff182c"/><stop offset="86%" stopColor="#81000d"/><stop offset="100%" stopColor="#090000"/>
        </radialGradient>
        <filter id={`sx-glow-${uid}`} x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id={`sx-clip-${uid}`}><circle cx="50" cy="50" r="43"/></clipPath>
      </defs>
      <circle cx="50" cy="50" r="47" fill="#000" stroke="#ff1728" strokeWidth="2.5" filter={`url(#sx-glow-${uid})`}/>
      <circle cx="50" cy="50" r="43.5" fill={`url(#sx-glass-${uid})`} stroke="#aaaeb7" strokeOpacity=".65" strokeWidth="1.2"/>
      <g clipPath={`url(#sx-clip-${uid})`}>
        <circle cx="50" cy="50" r="36" fill="none" stroke="#ff2839" strokeWidth="1.3" opacity=".8"/>
        <circle className="sx-eye-rotating-ring" cx="50" cy="50" r="31" fill="none" stroke="#ff2436" strokeWidth="2" strokeDasharray="1 3"/>
        <circle cx="50" cy="50" r="24" fill={`url(#sx-iris-${uid})`} stroke="#ff6670" strokeWidth="1.4" filter={`url(#sx-glow-${uid})`}/>
        {Array.from({length:36},(_,i)=><path key={i} d="M50 23 L50 29" transform={`rotate(${i*10} 50 50)`} stroke="#ff727c" strokeWidth={i%3===0?1.3:.65} opacity=".8"/>)}
        <g transform={`translate(${pupil.x} ${pupil.y})`}>
          <ellipse cx="50" cy="50" rx="8" ry="19" fill="#000" stroke="#ff283a" strokeWidth="2" filter={`url(#sx-glow-${uid})`}/>
          <ellipse cx="46.5" cy="42" rx="2.3" ry="5" fill="#fff" opacity=".75" transform="rotate(-25 46.5 42)"/>
        </g>
        <path d="M15 39 Q48 6 82 38" fill="none" stroke="#fff" strokeWidth="2" strokeOpacity=".3"/>
      </g>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff5965" strokeWidth=".7" opacity=".8"/>
    </svg>
  );
};
